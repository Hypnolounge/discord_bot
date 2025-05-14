from mysql import connector
from dc import User, Session, Strike, Compliment, Intro, Ticket
import datetime
import os

config = {
    "host": os.getenv("DB_HOST") or "localhost",
    "user": "root",
    "password": os.getenv("DB_PW"),
    "database": "hypnolounge",
    'charset': 'utf8mb4',
    'collation': 'utf8mb4_general_ci'
}
db = connector.connect(**config)
cur = db.cursor(buffered=True)


async def check_cursor():
    global db
    global cur

    try:
        cur.execute("SELECT * FROM users LIMIT 1")
        result = cur.fetchall()
    except:
        db.reconnect()
        cur = db.cursor(buffered=True)
        print("Cursor has been recreated!")


def set_test():
    global db
    global cur

    config["database"] = "hypnolounge_test"

    db = connector.connect(**config)
    cur = db.cursor(buffered=True)


### COMPLIMENTS ###
def add_compliment(compliment: Compliment):
    sql = "INSERT INTO {} (give, receive, comment) VALUES (%s, %s, %s)".format(
        compliment.__tablename__
    )
    val = (compliment.give, compliment.receive, compliment.comment)

    cur.execute(sql, val)
    db.commit()

    return cur.lastrowid


def rm_compliment(compliment: Compliment):
    if compliment.id is not None:
        sql = "DELETE FROM {} WHERE id=%s".format(compliment.__tablename__)
        val = (compliment.id,)

        cur.execute(sql, val)
        db.commit()


def get_compliment_by_id(compliment: Compliment):
    sql = "SELECT * FROM {} WHERE id=%s".format(compliment.__tablename__)
    val = (compliment.id,)

    cur.execute(sql, val)
    result = cur.fetchone()
    if result is not None:
        return Compliment(*result)
    else:
        return None


def get_compliments_by_userid(compliment: Compliment):
    sql = "SELECT * FROM {} WHERE give=%s OR receive=%s".format(
        compliment.__tablename__
    )
    val = (compliment.give, compliment.receive)

    cur.execute(sql, val)
    result = cur.fetchall()
    compliments = []
    if result is not None:
        for comp in result:
            compliments.append(Compliment(*comp))
    return compliments


### INTROS ###
def add_intro(intro: Intro):
    sql = "INSERT INTO {} (userID, message, text) VALUES (%s, %s, %s) ON DUPLICATE KEY UPDATE message=%s, text=%s".format(
        intro.__tablename__
    )
    val = (intro.userID, intro.message, intro.text, intro.message, intro.text)

    cur.execute(sql, val)
    db.commit()

    return cur.lastrowid


def rm_intro(intro: Intro):
    if intro.userID:
        sql = "DELETE FROM {} WHERE userID=%s".format(intro.__tablename__)
        val = (intro.userID,)

        cur.execute(sql, val)
        db.commit()


def get_intro_by_userid(intro: Intro):
    sql = "SELECT * FROM {} WHERE userID=%s".format(intro.__tablename__)
    val = (intro.userID,)

    cur.execute(sql, val)
    result = cur.fetchone()
    if result is not None:
        return Intro(*result)
    else:
        return None


def update_intro(intro: Intro):
    if get_intro_by_userid(intro) is not None:
        sql = "UPDATE {} SET message=%s, text=%s WHERE userID=%s".format(
            intro.__tablename__
        )
        val = (intro.message, intro.text, intro.userID)

        cur.execute(sql, val)
        db.commit()
    else:
        add_intro(intro)


### SESSIONS ###
def add_session(session: Session):
    sql = "INSERT INTO {} (userID, medium, date) VALUES (%s, %s, %s)".format(
        session.__tablename__
    )
    val = (session.userID, session.medium, session.date)

    cur.execute(sql, val)
    db.commit()

    return cur.lastrowid


def rm_session(session: Session):
    if session.id:
        sql = "DELETE FROM {} WHERE id=%s".format(session.__tablename__)
        val = (session.id,)

        cur.execute(sql, val)
        db.commit()


def get_session_by_id(session: Session):
    sql = "SELECT * FROM {} WHERE id=%s".format(session.__tablename__)
    val = (session.id,)

    cur.execute(sql, val)
    result = cur.fetchone()
    if result is not None:
        return Session(*result)
    else:
        return None


def get_sessions_by_userid(session: Session):
    sql = "SELECT * FROM {} WHERE userID=%s".format(session.__tablename__)
    val = (session.userID,)

    cur.execute(sql, val)
    result = cur.fetchall()
    sessions = []
    if result is not None:
        for sess in result:
            sessions.append(Session(*sess))
    return sessions


def get_total_sessions():
    sql = "SELECT COUNT(*) as count FROM sessions"
    cur.execute(sql)
    result = cur.fetchone()
    return result[0]


def get_last_weeks_sessions():
    current_date = datetime.datetime.now().replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    weekday = current_date.weekday()
    last_monday = current_date - datetime.timedelta(days=weekday)
    timestamp = last_monday.timestamp()

    sql = "SELECT COUNT(*) as count FROM sessions WHERE date > %s"
    val = (timestamp,)
    cur.execute(sql, val)
    result = cur.fetchone()
    return result[0]


### STRIKES ###
def add_strike(strike: Strike):
    sql = "INSERT INTO {} (userID, reason, severity) VALUES (%s, %s, %s)".format(
        strike.__tablename__
    )
    val = (strike.userID, strike.reason, strike.severity)

    cur.execute(sql, val)
    db.commit()

    return cur.lastrowid


def rm_strike(strike: Strike):
    if strike.id is not None:
        sql = "DELETE FROM {} WHERE id=%s".format(strike.__tablename__)
        val = (strike.id,)

        cur.execute(sql, val)
        db.commit()


def get_strike_by_id(strike: Strike):
    sql = "SELECT * FROM {} WHERE id=%s".format(strike.__tablename__)
    val = (strike.id,)

    cur.execute(sql, val)
    result = cur.fetchone()
    if result is not None:
        return Strike(*result)
    else:
        return None


def get_strikes_by_userid(strike: Strike):
    sql = "SELECT * FROM {} WHERE userID=%s".format(strike.__tablename__)
    val = (strike.userID,)

    cur.execute(sql, val)
    result = cur.fetchall()
    strikes = []
    if result is not None:
        for stri in result:
            strikes.append(Strike(*stri))
    return strikes


### USERS ###
def add_user(user: User):
    sql = "INSERT INTO {} (userID, name, displayname, `primary`, continent) VALUES (%s, %s, %s, %s, %s)".format(
        user.__tablename__
    )
    val = (user.userID, user.name, user.displayname, user.primary, user.continent)

    cur.execute(sql, val)
    db.commit()


def rm_user(user: User):
    if user.userID is not None:
        sql = "DELETE FROM {} WHERE id=%s".format(user.__tablename__)
        val = (user.userID,)

        cur.execute(sql, val)
        db.commit()


def get_user_by_id(user: User):
    sql = "SELECT * FROM {} WHERE userID=%s".format(user.__tablename__)
    val = (user.userID,)

    cur.execute(sql, val)
    result = cur.fetchone()
    if result is not None:
        return User(*result)
    else:
        return None


def get_user_by_name(user: User):
    sql = "SELECT * FROM {} WHERE name=%s".format(user.__tablename__)
    val = (user.name,)

    cur.execute(sql, val)
    result = cur.fetchone()
    if result is not None:
        return User(*result)
    else:
        return None


def update_user(user: User):
    if get_user_by_id(user) is not None:
        sql = "UPDATE {} SET name=%s, displayname=%s, `primary`=%s, continent=%s WHERE userID=%s".format(
            user.__tablename__
        )
        val = (user.name, user.displayname, user.primary, user.continent, user.userID)

        cur.execute(sql, val)
        db.commit()
    else:
        add_user(user)


### TICKETS ###


def add_ticket(ticket: Ticket):
    sql = "INSERT INTO {} (userID, type, channel, opened, closed, reason) VALUES (%s, %s, %s, %s, %s, %s)".format(
        ticket.__tablename__
    )
    val = (
        ticket.userID,
        ticket.type,
        ticket.channel,
        ticket.opened,
        ticket.closed,
        ticket.reason,
    )

    cur.execute(sql, val)
    db.commit()

    return cur.lastrowid


def update_ticket(ticket: Ticket):
    if get_ticket_by_id(ticket) is not None:
        sql = "UPDATE {} SET channel=%s, closed=%s, reason=%s WHERE id=%s".format(
            ticket.__tablename__
        )
        val = (ticket.channel, ticket.closed, ticket.reason, ticket.id)

        cur.execute(sql, val)
        db.commit()
    else:
        add_user(ticket)


def rm_ticket(ticket: Ticket):
    if ticket.id is not None:
        sql = "DELETE FROM {} WHERE id=%s".format(ticket.__tablename__)
        val = (ticket.id,)

        cur.execute(sql, val)
        db.commit()


def get_ticket_by_id(ticket: Ticket):
    sql = "SELECT * FROM {} WHERE id=%s".format(ticket.__tablename__)
    val = (ticket.id,)

    cur.execute(sql, val)
    result = cur.fetchone()
    if result is not None:
        return Ticket(*result)
    else:
        return None


def get_ticket_by_channel(ticket: Ticket):
    sql = "SELECT * FROM {} WHERE channel=%s".format(ticket.__tablename__)
    val = (ticket.channel,)

    cur.execute(sql, val)
    result = cur.fetchone()
    if result is not None:
        return Ticket(*result)
    else:
        return None


def get_ticket_by_user(ticket: Ticket):
    sql = "SELECT * FROM {} WHERE userID=%s".format(ticket.__tablename__)
    val = (ticket.userID,)

    cur.execute(sql, val)
    result = cur.fetchall()
    tickets = []
    if result is not None:
        for tick in result:
            tickets.append(Ticket(*tick))
    return tickets


def get_open_tickets():
    ticket = Ticket(closed=0.0)
    sql = "SELECT * FROM {} WHERE closed=%s".format(ticket.__tablename__)
    val = (ticket.closed,)

    cur.execute(sql, val)
    result = cur.fetchall()
    tickets = []
    if result is not None:
        for tick in result:
            tickets.append(Ticket(*tick))
    return tickets
