from datetime import datetime


class User:
    __tablename__ = "users"

    def __init__(self, userID=0, name="", displayname="", primary="", continent=""):
        self.userID = userID
        self.name = name
        self.displayname = displayname
        self.primary = primary
        self.continent = continent


class Session:
    __tablename__ = "sessions"

    def __init__(self, id=0, userID=0, medium="", date=datetime.now().timestamp()):
        if id:
            self.id = id
        else:
            self.id = -1
        self.userID = userID
        self.medium = medium
        self.date = date


class Strike:
    __tablename__ = "strikes"

    def __init__(self, id=0, userID=0, reason="", severity=1):
        if id:
            self.id = id
        else:
            self.id = -1
        self.userID = userID
        self.reason = reason
        self.severity = severity


class Compliment:
    __tablename__ = "compliments"

    def __init__(self, id=0, give=0, receive=0, comment=""):
        if id:
            self.id = id
        else:
            self.id = -1
        self.give = give
        self.receive = receive
        self.comment = comment


class Intro:
    __tablename__ = "intros"

    def __init__(self, userID=0, message=0, text=""):
        self.userID = userID
        self.text = text
        self.message = message


class Ticket:
    __tablename__ = "tickets"

    def __init__(
        self,
        id=0,
        userID=0,
        channel=0,
        type="",
        opened=datetime.now().timestamp(),
        closed=0.0,
        reason="",
    ):
        self.id = id
        self.userID = userID
        self.channel = channel
        self.type = type
        self.opened = opened
        self.closed = closed
        self.reason = reason
