import discord
from discord.ext import commands as cmd
from discord.ext import tasks
from dc import Intro, User, Session, Strike, Compliment, Ticket
import db as db
import time
import json
import os
import datetime
import sys
import dotenv
import re


""" string_to_bool = {"yes": True, "no": False}
args = sys.argv
test = string_to_bool[args[1]] """
dotenv.load_dotenv()
token = str(os.getenv("TOKEN"))
test = os.getenv("TEST", 0)

# guilds
hypnolounge_guild_id = 1125008815272759408
hypnolounge_guild = None
mod_role = 1125012454699704373
accepted_role = 1125830822801457306
member_role = 1125484694134341744
locktober_role = 1155774064267366460

# channels
test_channel_id = 1248249254569443399
survey_channel_id = 1136035878414864494
rules_channel_id = 1125011563670163497
stats_channel_id = 1136947478801944637
intro_channel_id = 1125014789450641458
roles_channel_id = 1125076347417538681
compliment_channel_id = 1139509140050415616
announce_channel_id = 1125854117408026655
info_channel_id = 1158521239174918195
strike_channel_id = 1125847005609082900
ticket_channel_id = 1125813015485370538
system_log_channel_id = 1125070879525715978
lf_tist_channel_id = 1125024527932456960
lf_sub_channel_id = 1125080015210557492
invites_channel_id = 1127480124279894076
ticket_log_channel_id = 1125812635141669005
locktober_announce_channel_id = 1156964262980358255
hypno_oc_channel_id = 1125080833842229338
system_log_channel = None
ticket_log_channel = None

# categories
application_category = 1128239441459286058
invite_category = 1128239504050896999
issue_category = 1128239530022015108
misc_category = 1184172707424764013
overflow_category = 1128059295527882943


autodelete_channels = [
    1125080833842229338,  # hypno original
    1125081114923507735,  # hypno related
    1125089010822434866,  # files scripts
    1125095139212263516,  # nsfw selfies
    1125087513615290409,  # sfw selfies
    1155774907695759370,  # locktober nsfw selfies
    1201173532613292092,  # pet photos
]

if test:
    survey_channel_id = test_channel_id
    stats_channel_id = test_channel_id
    intro_channel_id = test_channel_id
    roles_channel_id = test_channel_id
    compliment_channel_id = test_channel_id
    autodelete_channels = [test_channel_id]
    announce_channel_id = test_channel_id
    info_channel_id = test_channel_id
    strike_channel_id = test_channel_id
    ticket_channel_id = test_channel_id
    locktober_announce_channel_id = test_channel_id
    lf_tist_channel_id = test_channel_id
    lf_sub_channel_id = test_channel_id

    intro_channel_id = 0
    mod_role = 0

# files/data
last_message_file = "last_message.json"
last_message_data = {}
general_data_file = "general_data.json"
general_data = {}

if test:
    last_message_file = "test_" + last_message_file
    general_data_file = "test_" + general_data_file
    db.set_test()

# other

invite_link = "https://discord.gg/Caz6NHR2Zu"
intro_jump_url = ""

# bot
intents = discord.Intents.all()
activity = discord.Game(name="with minds since 2023")
command_prefix = "?"
if test:
    command_prefix = ":"
bot = cmd.Bot(command_prefix=command_prefix, intents=intents, activity=activity)


# role dictionaries

kinks_emoji_to_role = {
    "🐻": 1125486422720270356,
    "🧠": 1125486732217958410,
    "🔒": 1125486951785562302,
    "🤖": 1125487033545130156,
    "🤤": 1125487095943811172,
    "🏖": 1125487191372615754,
    "😳": 1125503261647048734,
    "🦶": 1125487481089953813,
    "👗": 1125487591140110356,
    "🦊": 1125487663760285747,
    "💪": 1125487745138180096,
    "<:latex:1125492553878339635>": 1125487798594584677,
    "🤠": 1125487856094281790,
    "<:statue:1125492407375495188>": 1125487901451501588,
    "💦": 1125487956073906276,
    "🐕‍🦺": 1125488431401808084,
    "🩲": 1125488055508283552,
}

kinks_emoji_to_name = {
    "🐻": "bears",
    "🧠": "brainwashing/reprogramming",
    "🔒": "chastity",
    "🤖": "drones",
    "🤤": "dumb/himbo/goon/mindless",
    "🏖": "exhibitionism",
    "😳": "humiliation",
    "🦶": "feet",
    "👗": "feminisation",
    "🦊": "furries",
    "💪": "jocks/muscle",
    "<:latex:1125492553878339635>": "latex/lycra",
    "🤠": "leather",
    "<:statue:1125492407375495188>": "objectification",
    "💦": "orgasms/cum",
    "🐕‍🦺": "pups",
    "🩲": "underwear",
}

type_emoji_to_name = {
    "🗒️": "text",
    "☎️": "voice",
    "🎞️": "video",
    "👬": "in-person",
    "🫢": "covert (People can assume you're ok with covert hypnosis without needing to ask you.)",
}

type_emoji_to_role = {
    "🗒️": 1155586410556960888,
    "☎️": 1155586432992284743,
    "🎞️": 1155586463027703850,
    "👬": 1155586478697615380,
    "🫢": 1158508017940168844,
}

now_emoji = "⌚"

addtional_emoji_to_role = {
    "📢": 1194055463889797140,
    "🎮": 1194055403743498270,
    "🌀": 1198646662160195695,
}

now_primary_to_role = {
    "hypnotist": 1156298225523896321,
    "subject": 1156298677695025172,
    "switch": 1156298728475476018,
    "undecided": 1156298728475476018,
}

# READY


@bot.event
async def on_ready():
    print(f"Logged in as {bot.user.name}")
    global last_message_data
    global general_data
    global system_log_channel
    global ticket_log_channel
    global intro_jump_url
    global hypnolounge_guild
    global type_emoji_to_role
    global kinks_emoji_to_role
    global now_primary_to_role
    global addtional_emoji_to_role

    last_message_data = load_json(last_message_file)
    general_data = load_json(general_data_file)
    guild = bot.get_guild(hypnolounge_guild_id)
    hypnolounge_guild = guild
    intro = bot.get_channel(intro_channel_id)
    if intro:
        intro_jump_url = intro.jump_url

    for k, v in type_emoji_to_role.items():
        role = guild.get_role(v)
        type_emoji_to_role[k] = role
        time.sleep(0.2)

    for k, v in kinks_emoji_to_role.items():
        role = guild.get_role(v)
        kinks_emoji_to_role[k] = role
        time.sleep(0.2)

    for k, v in now_primary_to_role.items():
        role = guild.get_role(v)
        now_primary_to_role[k] = role
        time.sleep(0.2)

    for k, v in addtional_emoji_to_role.items():
        role = guild.get_role(v)
        addtional_emoji_to_role[k] = role
        time.sleep(0.2)

    system_log_channel = bot.get_channel(system_log_channel_id)
    ticket_log_channel = bot.get_channel(ticket_log_channel_id)

    # AutoMessage in roles channel
    await check_roles_messages()
    # AutoMessage in ticket channel
    time.sleep(0.2)
    await check_ticket_message()
    # Check the tickets and its messages
    time.sleep(0.2)
    await check_tickets()
    # AutoMessage in survey channel
    time.sleep(0.2)
    await check_survey_messages()
    # AutoMessage in info channel
    time.sleep(0.2)
    await check_info_message()
    # AutoMessage in strike channel
    time.sleep(0.2)
    await check_strike_message()
    # AutoMessage in stats channel
    if not test:
        update_stats.start()
        time.sleep(5)

    # update_locktober.start()
    check_cursor.start()


# COMMANDS


@bot.command()
@cmd.has_permissions(administrator=True)
async def purge(ctx, amount: int):
    if amount <= 0:
        await ctx.send("Please provide a positive number of messages to delete.")
        return

    try:
        await ctx.channel.purge(limit=amount + 1)
        await ctx.send(f"Successfully deleted {amount} messages.", delete_after=10)
    except discord.Forbidden:
        await ctx.send("I don't have permission to delete messages.")


@bot.command()
@cmd.has_permissions(administrator=True)
async def say(ctx, *, message):
    await ctx.send(message)
    await ctx.message.delete()


# EVENTS


async def auto_delete(message: discord.Message):
    if message.author.bot:
        return False

    # AUTO DELETES
    if message.channel.id in autodelete_channels:
        if message.author.get_role(mod_role):
            return False

        has_content = bool(message.attachments)
        has_link = any(link in message.content for link in ["http://", "https://"])
        if has_link or has_content:
            return False

        await message.delete()

        if message.is_system():
            return True

        await message.author.send(
            "Your post in {} was deleted because it did not contain a media file.".format(
                message.channel.mention
            )
        )
        return True

    # INTRO ROLE
    if message.channel.id == intro_channel_id:
        if len(message.content) >= 300:
            role = message.guild.get_role(member_role)
            await message.author.add_roles(role)
            if db.get_user_by_id(User(userID=message.author.id)) is None:
                createUser(message.author)
            db.add_intro(Intro(message.author.id, message.id, message.content))
            return True
        else:
            await message.delete()
            await message.author.send(
                content="Your intro is too short, say more.😥 You can post another intro in 6 hours."
            )
            return True


async def announcements(message: discord.Message):
    if message.author.bot:
        return

    # BOOST ANNOUNCE
    if message.type == discord.MessageType.premium_guild_subscription:
        announce = bot.get_channel(announce_channel_id)
        await announce.send(
            "Thank you {} for boosting the Hypnolounge! I love you ❤️".format(
                message.author.mention
            )
        )

    if message.is_system():
        return

    # NOW PING
    try:
        if message.channel.id == lf_tist_channel_id:
            msg = "{} {}".format(
                now_primary_to_role["hypnotist"].mention,
                now_primary_to_role["switch"].mention,
            )
            ping = await message.channel.send(msg)
            await ping.delete()
        if message.channel.id == lf_sub_channel_id:
            msg = "{} {}".format(
                now_primary_to_role["subject"].mention,
                now_primary_to_role["switch"].mention,
            )
            ping = await message.channel.send(msg)
            await ping.delete()
    except AttributeError as e:
        for k, v in now_primary_to_role.items():
            now_primary_to_role[k] = message.guild.get_role(v)

    # ANNOUNCEMENT
    if message.channel.id == announce_channel_id:
        role = addtional_emoji_to_role["📢"]
        text = message.content + "\n" + role.mention
        msg = await message.channel.send(text)
        await msg.delete()

    # HOC
    if message.channel.id == hypno_oc_channel_id:
        role = addtional_emoji_to_role["🌀"]
        text = "New post in hypno-original-content " + role.mention
        msg = await message.channel.send(text)
        await msg.delete()


@bot.event
async def on_message(message: discord.Message):

    deleted = await auto_delete(message)
    if not deleted:
        await announcements(message)
    await bot.process_commands(message)


@bot.event
async def on_raw_message_edit(msg):
    author = msg.data.get("author", False)
    if author:
        if not author.get("bot", False):
            if msg.channel_id == intro_channel_id:
                channel = await bot.fetch_channel(msg.channel_id)
                message = await channel.fetch_message(msg.message_id)
                if not message.author.bot:
                    user = message.author
                    new_content = msg.data["content"]
                    if db.get_user_by_id(User(userID=user.id)) is None:
                        createUser(user)
                    db.add_intro(Intro(user.id, msg.message_id, new_content))


@bot.event
async def on_raw_reaction_add(reaction: discord.RawReactionActionEvent):
    if not reaction.member.bot:
        if reaction.message_id == read_message_id("kink_roles_messages"):
            debug("caught reaction add")
            role = kinks_emoji_to_role.get(str(reaction.emoji))
            if role:
                await reaction.member.add_roles(role)
        if reaction.message_id == read_message_id("session_type_roles_messages"):
            debug("caught reaction add")
            role = type_emoji_to_role.get(str(reaction.emoji))
            if role:
                await reaction.member.add_roles(role)
        if reaction.message_id == read_message_id("now_roles_messages"):
            prim = get_primary_role(reaction.member)
            role = now_primary_to_role.get(prim, None)
            if role:
                await reaction.member.add_roles(role)
        if reaction.message_id == read_message_id("notification_roles_messages"):
            role = addtional_emoji_to_role.get(str(reaction.emoji))
            if role:
                await reaction.member.add_roles(role)


@bot.event
async def on_raw_reaction_remove(reaction: discord.RawReactionActionEvent):
    user = await hypnolounge_guild.fetch_member(reaction.user_id)
    if not user.bot:
        if reaction.message_id == read_message_id("kink_roles_messages"):
            debug("caught reaction remove")
            role = kinks_emoji_to_role.get(str(reaction.emoji))
            if role:
                await user.remove_roles(role)
        if reaction.message_id == read_message_id("session_type_roles_messages"):
            debug("caught reaction remove")
            role = type_emoji_to_role.get(str(reaction.emoji))
            if role:
                await user.remove_roles(role)
        if reaction.message_id == read_message_id("now_roles_messages"):
            await user.remove_roles(*now_primary_to_role.values())
        if reaction.message_id == read_message_id("notification_roles_messages"):
            role = addtional_emoji_to_role.get(str(reaction.emoji))
            if role:
                await user.remove_roles(role)


@tasks.loop(minutes=1)
async def update_stats():
    stats_message_ids = read_message_id("stats_messages")
    embeds = build_stats_embeds()
    stats_channel = bot.get_channel(stats_channel_id)

    rebuild = False
    if isinstance(stats_message_ids, dict):
        for type, embed in embeds.items():
            try:
                last_message = await stats_channel.fetch_message(
                    stats_message_ids[type]
                )
                await last_message.edit(embeds=embed)
                time.sleep(2)
            except discord.NotFound:
                rebuild = True
            except:
                pass
    else:
        rebuild = True

    if rebuild:
        message_ids = {}
        await stats_channel.send("# Hypnolounge Statistics\nUpdates every minute")
        for type, embed in embeds.items():
            message = await stats_channel.send(embeds=embed)
            message_ids[type] = message.id
            time.sleep(2)
        write_message_id("stats_messages", message_ids)


@tasks.loop(minutes=5)
async def update_locktober():
    locktober_message_id = read_message_id("locktober_stats_messages")
    embed = build_locktober_embeds()
    announce_channel = bot.get_channel(locktober_announce_channel_id)

    rebuild = False
    if locktober_message_id:
        try:
            last_message = await announce_channel.fetch_message(locktober_message_id)
            await last_message.edit(embed=embed)
            time.sleep(2)
        except discord.NotFound:
            rebuild = True
    else:
        rebuild = True

    if rebuild:
        message = await announce_channel.send(embed=embed)
        write_message_id("locktober_stats_messages", message.id)


@tasks.loop(minutes=5)
async def check_cursor():
    await db.check_cursor()


# FUNCTIONS


def load_json(file):
    if os.path.exists(file):
        try:
            debug("loading data successful")
            with open(file, "r") as json_data:
                data = json.load(json_data)
                return data
        except (FileNotFoundError, ValueError):
            return {}
    else:
        debug("couldnt find file: {}, creating new".format(file))
        with open(file, "w") as json_file:
            json.dump({}, json_file, indent=4, sort_keys=True)
        return {}


def read_message_id(id):
    return last_message_data.get(id)


def write_message_id(id, message_id):
    last_message_data[id] = message_id
    with open(last_message_file, "w") as json_file:
        json.dump(last_message_data, json_file, indent=4, sort_keys=True)


def read_data_by_id(id):
    return general_data.get(id)


def write_data_by_id(id, data):
    general_data[id] = data
    with open(general_data_file, "w") as json_file:
        json.dump(general_data, json_file, indent=4, sort_keys=True)


def debug(msg):
    if test:
        print(msg)


# COLLECT VIEW AND DATA

# checks


async def check_survey_messages():
    survey_message_id = read_message_id("survey_message")
    survey_channel = bot.get_channel(survey_channel_id)
    survey_view = SurveyView(timeout=None)

    survey_embed = discord.Embed(
        title="Session Counter",
        description="Click the button of the type of session you had. This helps us keep track of server activity. You do not need to add a name and compliment. Thanks!",
        color=discord.Color.blurple(),
    )
    survey_embed.set_footer(text="PupNicky")

    rebuild = False
    if survey_message_id:
        try:
            last_message = await survey_channel.fetch_message(survey_message_id)
            await last_message.edit(embed=survey_embed, view=survey_view)
            time.sleep(2)
        except discord.NotFound:
            rebuild = True
    else:
        rebuild = True

    if rebuild:
        survey_message = await survey_channel.send(embed=survey_embed, view=survey_view)
        write_message_id("survey_message", survey_message.id)


async def check_roles_messages():
    role_channel = bot.get_channel(roles_channel_id)

    # primary

    primary_message_id = read_message_id("primary_roles_messages")
    primary_view = PrimaryRoleView(timeout=None)
    primary_embed = discord.Embed(
        title="Primary Role",
        description="Choose a primary role here. Without a primary role, you will not have access to the rest of the server.",
    )
    primary_embed.set_footer(text="PupNicky")

    rebuild = False
    if primary_message_id:
        try:
            last_message = await role_channel.fetch_message(primary_message_id)
            await last_message.edit(embed=primary_embed, view=primary_view)
            time.sleep(2)
        except discord.NotFound:
            rebuild = True
    else:
        rebuild = True

    # continent

    continent_message_id = read_message_id("continent_roles_messages")
    continent_view = ContinentRoleView(timeout=None)
    continent_embed = discord.Embed(
        title="Continent Role",
        description="Select the continent you live on.",
    )
    continent_embed.set_footer(text="PupNicky")

    if continent_message_id:
        try:
            last_message = await role_channel.fetch_message(continent_message_id)
            await last_message.edit(embed=continent_embed, view=continent_view)
            time.sleep(1)
        except discord.NotFound:
            rebuild = True
    else:
        rebuild = True

    # session

    session_message_id = read_message_id("session_roles_messages")
    session_view = SessionRoleView(timeout=None)
    session_embed = discord.Embed(
        title="Looking For Sessions",
        description="Choose if you are open for sessions or not",
    )
    session_embed.set_footer(text="PupNicky")

    if session_message_id:
        try:
            last_message = await role_channel.fetch_message(session_message_id)
            await last_message.edit(embed=session_embed, view=session_view)
            time.sleep(1)
        except discord.NotFound:
            rebuild = True
    else:
        rebuild = True

    if read_message_id("now_roles_messages") is None:
        rebuild = True

    # session type
    session_type_message_id = read_message_id("session_type_roles_messages")
    desc = ""
    for emoji, name in type_emoji_to_name.items():
        desc = desc + emoji + ":" + name + "\n"

    type_embed = discord.Embed(
        title="Types of Sessions",
        description=desc,
    )
    type_embed.set_footer(text="PupNicky")

    if session_type_message_id:
        try:
            last_message = await role_channel.fetch_message(session_type_message_id)
            reactions = last_message.reactions
            last_emojis = []
            add_emojis = []
            for reaction in reactions:
                last_emojis.append(str(reaction.emoji))
            for emoji, _ in type_emoji_to_name.items():
                try:
                    last_emojis.remove(emoji)
                except ValueError as e:
                    add_emojis.append(emoji)
            for emoji in add_emojis:
                time.sleep(0.5)
                await last_message.add_reaction(discord.PartialEmoji.from_str(emoji))
            for emoji in last_emojis:
                time.sleep(0.5)
                await last_message.clear_reaction(discord.PartialEmoji.from_str(emoji))
            time.sleep(1)
            await last_message.edit(embed=type_embed)
        except discord.NotFound:
            rebuild = True
    else:
        rebuild = True

    # dm

    dm_message_id = read_message_id("dm_roles_messages")
    dm_view = DMRoleView(timeout=None)
    dm_embed = discord.Embed(
        title="Open DMs",
        description="Choose if your DMs are open or not",
    )
    dm_embed.set_footer(text="PupNicky")

    if dm_message_id:
        try:
            last_message = await role_channel.fetch_message(dm_message_id)
            await last_message.edit(embed=dm_embed, view=dm_view)
            time.sleep(1)
        except discord.NotFound:
            rebuild = True
    else:
        rebuild = True

    # kink

    kink_message_id = read_message_id("kink_roles_messages")
    desc = ""
    for emoji, name in kinks_emoji_to_name.items():
        desc = desc + emoji + ":" + name + "\n"

    kink_embed = discord.Embed(
        title="Kinks",
        description=desc,
    )
    kink_embed.set_footer(text="PupNicky")

    if kink_message_id:
        try:
            last_message = await role_channel.fetch_message(kink_message_id)
            reactions = last_message.reactions
            last_emojis = []
            add_emojis = []
            for reaction in reactions:
                last_emojis.append(str(reaction.emoji))
            for emoji, _ in kinks_emoji_to_name.items():
                try:
                    last_emojis.remove(emoji)
                except ValueError as e:
                    add_emojis.append(emoji)
            for emoji in add_emojis:
                time.sleep(0.5)
                await last_message.add_reaction(discord.PartialEmoji.from_str(emoji))
            for emoji in last_emojis:
                time.sleep(0.5)
                await last_message.clear_reaction(discord.PartialEmoji.from_str(emoji))
            time.sleep(1)
            await last_message.edit(embed=kink_embed)
        except discord.NotFound:
            rebuild = True
    else:
        rebuild = True

    # notification
    notification_message_id = read_message_id("notification_roles_messages")
    addtional_embed = discord.Embed(
        title="Notification Roles",
        description="If you have these roles, every time someone post in its corresponding channel, you will get a notification.\n 📢: Announcements\n🎮: Gaming events\n🌀: hypno-original-content",
    )
    if notification_message_id:
        try:
            last_message = await role_channel.fetch_message(notification_message_id)
            reactions = last_message.reactions
            last_emojis = []
            add_emojis = []
            for reaction in reactions:
                last_emojis.append(str(reaction.emoji))
            for emoji, _ in addtional_emoji_to_role.items():
                try:
                    last_emojis.remove(emoji)
                except ValueError as e:
                    add_emojis.append(emoji)
            for emoji in add_emojis:
                time.sleep(0.5)
                await last_message.add_reaction(discord.PartialEmoji.from_str(emoji))
            for emoji in last_emojis:
                time.sleep(0.5)
                await last_message.clear_reaction(discord.PartialEmoji.from_str(emoji))
            time.sleep(1)
            await last_message.edit(content="", embed=addtional_embed)
        except discord.NotFound:
            rebuild = True

    if rebuild:
        # primary
        primary_message = await role_channel.send(
            embed=primary_embed, view=primary_view
        )
        write_message_id("primary_roles_messages", primary_message.id)
        time.sleep(2)
        # session
        session_message = await role_channel.send(
            embed=session_embed, view=session_view
        )
        write_message_id("session_roles_messages", session_message.id)
        time.sleep(2)
        # now
        now_embed = discord.Embed(
            title="looking-for Notifications",
            description="If you have this role, you will receive notifications every time someone messages in one of the looking-for channels relevant to your primary role:\nhypnotists get notifications from looking-for-tists\nsubs get notifications from looking-for-subs\nswitches and undecideds get notifications from both",
        )
        now_embed.set_footer(text="PupNicky")
        now_message = await role_channel.send(embed=now_embed)
        await now_message.add_reaction(discord.PartialEmoji.from_str(now_emoji))
        write_message_id("now_roles_messages", now_message.id)
        time.sleep(2)
        # session type
        desc = ""
        for emoji, name in type_emoji_to_name.items():
            desc = desc + emoji + ":" + name + "\n"

        type_embed = discord.Embed(
            title="Types of Sessions",
            description=desc,
        )
        type_embed.set_footer(text="PupNicky")
        type_message = await role_channel.send(embed=type_embed)
        write_message_id("session_type_roles_messages", type_message.id)
        for k, v in type_emoji_to_name.items():
            time.sleep(0.5)
            await type_message.add_reaction(discord.PartialEmoji.from_str(k))
        time.sleep(2)
        # dm
        dm_message = await role_channel.send(embed=dm_embed, view=dm_view)
        write_message_id("dm_roles_messages", dm_message.id)
        time.sleep(2)
        # continent
        continent_message = await role_channel.send(
            embed=continent_embed, view=continent_view
        )
        write_message_id("continent_roles_messages", continent_message.id)
        time.sleep(2)
        # kinks
        kink_message = await role_channel.send(embed=kink_embed)
        write_message_id("kink_roles_messages", kink_message.id)
        for k, v in kinks_emoji_to_name.items():
            time.sleep(0.5)
            await kink_message.add_reaction(discord.PartialEmoji.from_str(k))

        # notification
        addtional_message = await role_channel.send(embed=addtional_embed)
        write_message_id("notification_roles_messages", addtional_message.id)
        for k, v in addtional_emoji_to_role.items():
            time.sleep(0.5)
            await addtional_message.add_reaction(discord.PartialEmoji.from_str(k))


async def check_strike_message():
    strike_message_id = read_message_id("strike_message")
    strike_channel = bot.get_channel(strike_channel_id)
    strike_view = StrikeView(timeout=None)

    strike_embed = discord.Embed(
        title="Strike",
        description="You can add, delete and view the strikes.",
        color=discord.Color.blurple(),
    )

    strike_embed.set_footer(text="PupNicky")

    rebuild = False
    if strike_message_id:
        try:
            last_message = await strike_channel.fetch_message(strike_message_id)
            await last_message.edit(embed=strike_embed, view=strike_view)
            time.sleep(2)
        except discord.NotFound:
            rebuild = True
    else:
        rebuild = True

    if rebuild:
        strike_message = await strike_channel.send(embed=strike_embed, view=strike_view)
        write_message_id("strike_message", strike_message.id)


async def check_info_message():
    info_message_id = read_message_id("info_message")
    info_channel = bot.get_channel(info_channel_id)
    info_view = InfoView(timeout=None)

    info_embed = discord.Embed(
        title="Info Centre",
        description="Click the button and enter a name to get some basic information on a user.",
        color=discord.Color.blurple(),
    )

    info_embed.set_footer(text="PupNicky")

    rebuild = False
    if info_message_id:
        try:
            last_message = await info_channel.fetch_message(info_message_id)
            await last_message.edit(embed=info_embed, view=info_view)
            time.sleep(2)
        except discord.NotFound:
            rebuild = True
    else:
        rebuild = True

    if rebuild:
        info_message = await info_channel.send(embed=info_embed, view=info_view)
        write_message_id("info_message", info_message.id)


async def check_ticket_message():
    ticket_message_id = read_message_id("ticket_message")
    ticket_channel = bot.get_channel(ticket_channel_id)
    ticket_view = TicketView(timeout=None)

    ticket_embed = discord.Embed(
        title="Tickets",
        description="Choose one of the options below:\nApplication: You would like to become a member of the Hypnolounge.\nIssue: You would like to report an issue in general ranging from bugs, to server issues, to serious incidents.\nInvite: You would like to invite someone to the Hypnolounge.\nMisc: Anything else.",
        color=discord.Color.blurple(),
    )

    ticket_embed.set_footer(text="PupNicky")

    rebuild = False
    if ticket_message_id:
        try:
            last_message = await ticket_channel.fetch_message(ticket_message_id)
            await last_message.edit(embed=ticket_embed, view=ticket_view)
            time.sleep(2)
        except discord.NotFound:
            rebuild = True
    else:
        rebuild = True

    if rebuild:
        ticket_message = await ticket_channel.send(embed=ticket_embed, view=ticket_view)
        write_message_id("ticket_message", ticket_message.id)


async def check_tickets():
    tickets = db.get_open_tickets()
    descriptions = {
        "application": "",
        "invite": "Give us a few information on who you'd like to invite here. We will try to make their application as easy as we can.",
        "issue": "After filling up the form, you may add any information you've forgotten and attach any proof you have in this chat. The mods will contact everyone you have named and ask them for their side of the story.",
        "misc": "",
    }

    for ticket in tickets:
        channel = bot.get_channel(ticket.channel)
        type = ticket.type
        if channel is None:
            ticket.closed = datetime.datetime.now().timestamp()
            ticket.reason = "closed"
            db.update_ticket(ticket)
            break

        messages = [
            message async for message in channel.history(limit=None, oldest_first=True)
        ]
        found = False
        for message in messages:
            if message.author.bot:
                found = True
                break

        if not found:
            view = (
                ApplicationCloseView(timeout=None)
                if type == "application"
                else DefaultCloseView(timeout=None)
            )
            embed = discord.Embed(
                title="REPLACEMENT {} Ticket".format(type.capitalize()),
                description=descriptions[type],
                color=discord.Color.blurple(),
            )
            await channel.send(embed=embed, view=view)
            break
        else:
            view = (
                ApplicationCloseView(timeout=None)
                if type == "application"
                else DefaultCloseView(timeout=None)
            )
            embeds = message.embeds

            await message.edit(embeds=embeds, view=view)


# tickets


async def create_ticket_channel(
    interaction: discord.Interaction, type: str, data: dict
):
    categories = {
        "application": application_category,
        "invite": invite_category,
        "issue": issue_category,
        "misc": misc_category,
        "overflow": overflow_category,
    }
    descriptions = {
        "application": "",
        "invite": "Give us a few information on who you'd like to invite here. We will try to make their application as easy as we can.",
        "issue": "After filling up the form, you may add any information you've forgotten and attach any proof you have in this chat. The mods will contact everyone you have named and ask them for their side of the story.",
        "misc": "",
    }

    mod = interaction.guild.get_role(mod_role)
    category = bot.get_channel(categories[type])
    view = (
        ApplicationCloseView(timeout=None)
        if type == "application"
        else DefaultCloseView(timeout=None)
    )

    user = interaction.user

    ticket = Ticket(userID=user.id, type=type)
    id = db.add_ticket(ticket)
    ticket.id = id

    overwrites = {
        interaction.guild.default_role: discord.PermissionOverwrite(view_channel=False),
        user: discord.PermissionOverwrite(
            view_channel=True,
            send_messages=True,
        ),
    }
    channel = None
    try:
        channel = await category.create_text_channel(
            name="{}-{}-{}".format(type, id, user.name), overwrites=overwrites
        )
    except:
        try:
            category = bot.get_channel(categories["overflow"])
            channel = await category.create_text_channel(
                name="{}-{}-{}".format(type, id, user.name), overwrites=overwrites
            )
        except:
            await interaction.followup.send(
                "There has been an error. Please try again later.", ephemeral=True
            )
            channel = bot.get_channel(system_log_channel)
            channel.send("Please check tickets. There might be an overflow issue.")
            return

    ticket.channel = channel.id
    db.update_ticket(ticket)

    embed = discord.Embed(
        title="{} Ticket".format(type.capitalize()),
        description=descriptions[type],
        color=discord.Color.blurple(),
    )
    embed.set_footer(text="PupNicky")

    for k, v in data.items():
        embed.add_field(name=k, value=v, inline=False)

    if type == "application":
        tickets = db.get_ticket_by_user(Ticket(userID=user.id))
        previous = {
            "approved": 0,
            "incomplete": 0,
            "denied": 0,
            "closed": 0,
            "expired": 0,
        }
        for ticket in tickets:
            if ticket.type == "application":
                if len(ticket.reason) > 1:
                    previous[ticket.reason] += 1
        msg = ""
        for k, v in previous.items():
            msg += "**{}**: {}, ".format(k, v)
        embed.add_field(name="Previous Tickets", value=msg, inline=False)

    await channel.send(embed=embed, view=view)
    if type == "application":
        msgs = [
            "Welcome to the Hypnolounge! We're sure you're excited to enter and do all the horny things you'd like to do, but before anything, please answer these questions.",
            "1. How did you find the Hypnolounge?",
            "2. What got you into hypnosis and why you're into hypnosis?",
            "3. Could you share a particular experience you've had with hypnosis, if you have any?",
            "4. Do you have any hobbies or kinks besides hypnosis?",
            "5. What's the password? If you don't know the password, go back to <#1125011563670163497> and look for it there. We can't tell you where it is because we actually want you to read the rules.",
            "6. Please send us some proof of your age. Read the <#1125011563670163497> for what kind we will accept."
        ]
        for msg in msgs:
            await channel.send(msg)
            time.sleep(0.25)

    # pings
    mod_ping = await channel.send(mod.mention)
    await mod_ping.delete()
    user_ping = await channel.send(user.mention)
    await user_ping.delete()

    await interaction.followup.send(
        "The ticket has been created! {}".format(channel.jump_url), ephemeral=True
    )
    return channel


async def delete_ticket_channel(ticket: Ticket):
    channel = bot.get_channel(ticket.channel)
    await channel.delete(reason="closed")
    db.update_ticket(ticket)


class TicketView(discord.ui.View):
    @discord.ui.button(label="Application", style=discord.ButtonStyle.blurple)
    async def applic(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.send_modal(ApplicationModal())

    @discord.ui.button(label="Invite", style=discord.ButtonStyle.blurple)
    async def invite(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.send_modal(InviteModal())

    @discord.ui.button(label="Issue", style=discord.ButtonStyle.blurple)
    async def issue(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.send_modal(IssueModal())

    @discord.ui.button(label="Misc", style=discord.ButtonStyle.blurple)
    async def misc(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.defer(thinking=True, ephemeral=True)
        await create_ticket_channel(interaction, "misc", {})


class ApplicationModal(discord.ui.Modal, title="Open an application ticket"):
    age = discord.ui.TextInput(label="Age", required=True)

    country = discord.ui.TextInput(label="Country", required=False)

    role = discord.ui.TextInput(
        label="Role",
        required=True,
        placeholder="Hypnotist, Subject, Switch or Undecided",
    )

    exp = discord.ui.TextInput(label="years of hypnosis experience", required=True)

    async def on_submit(self, interaction: discord.Interaction):
        await interaction.response.defer(thinking=True, ephemeral=True)
        data = {
            self.age.label: self.age.value,
            self.country.label: self.country.value,
            self.role.label: self.role.value,
            self.exp.label: self.exp.value,
        }
        await create_ticket_channel(interaction, "application", data)


class InviteModal(discord.ui.Modal, title="Open an invite ticket"):
    tag = discord.ui.TextInput(label="Discord Tag", required=True)
    realtion = discord.ui.TextInput(
        label="Realtion to you", required=True, style=discord.TextStyle.long
    )

    async def on_submit(self, interaction: discord.Interaction):
        await interaction.response.defer(thinking=True, ephemeral=True)
        data = {
            self.tag.label: self.tag.value,
            self.realtion.label: self.realtion.value,
        }
        await create_ticket_channel(interaction, "invite", data)


class IssueModal(discord.ui.Modal, title="Open an issue ticket"):
    type = discord.ui.TextInput(label="Type of issue", required=True)

    events = discord.ui.TextInput(
        label="Events", required=True, style=discord.TextStyle.paragraph
    )

    people = discord.ui.TextInput(
        label="People involved", required=False, style=discord.TextStyle.long
    )

    async def on_submit(self, interaction: discord.Interaction):
        await interaction.response.defer(thinking=True, ephemeral=True)
        data = {
            self.type.label: self.type.value,
            self.events.label: self.events.value,
            self.people.label: self.people.value,
        }
        await create_ticket_channel(interaction, "issue", data)


class ApplicationCloseView(discord.ui.View):
    @discord.ui.button(label="Approve", style=discord.ButtonStyle.green)
    async def approved(
        self, interaction: discord.Interaction, button: discord.ui.Button
    ):
        if interaction.user.get_role(mod_role):
            await interaction.response.send_modal(ApplicationCloseModal("approved"))
        else:
            await interaction.response.send_message(
                "You are not allowed to do that!", ephemeral=True
            )

    @discord.ui.button(label="Incomplete", style=discord.ButtonStyle.red)
    async def incomplete(
        self, interaction: discord.Interaction, button: discord.ui.Button
    ):
        if interaction.user.get_role(mod_role):
            await interaction.response.send_modal(ApplicationCloseModal("incomplete"))
        else:
            await interaction.response.send_message(
                "You are not allowed to do that!", ephemeral=True
            )

    @discord.ui.button(label="Deny", style=discord.ButtonStyle.red)
    async def deny(self, interaction: discord.Interaction, button: discord.ui.Button):
        if interaction.user.get_role(mod_role):
            await interaction.response.send_modal(ApplicationCloseModal("denied"))
        else:
            await interaction.response.send_message(
                "You are not allowed to do that!", ephemeral=True
            )

    @discord.ui.button(label="Expired", style=discord.ButtonStyle.blurple)
    async def expired(
        self, interaction: discord.Interaction, button: discord.ui.Button
    ):
        if interaction.user.get_role(mod_role):
            await interaction.response.send_modal(ApplicationCloseModal("expired"))
        else:
            await interaction.response.send_message(
                "You are not allowed to do that!", ephemeral=True
            )

    @discord.ui.button(label="Close Ticket", style=discord.ButtonStyle.grey)
    async def user_close(
        self, interaction: discord.Interaction, button: discord.ui.Button
    ):
        await interaction.response.send_modal(ApplicationCloseModal("closed"))


class ApplicationCloseModal(discord.ui.Modal, title="Close Ticket"):
    def __init__(self, reason: str):
        super().__init__()
        self.reason = reason

    comment = discord.ui.TextInput(
        label="Comment", required=False, style=discord.TextStyle.long
    )

    async def on_submit(self, interaction: discord.Interaction):
        await interaction.response.defer(thinking=True)
        reasons = {
            "approved": "Welcome! Head to {} and introduce yourself there. Then, you will be able to choose a role. Choose a primary role, then come and say hi in General!".format(
                intro_jump_url
            ),
            "expired": "You have taken longer than three days to finish your application. Feel free to try again, but we are denying you for now. ({})".format(
                invite_link
            ),
            "denied": "You haven't convinced us that you would be a good fit in the Hypnolounge. We want our members to be able to contribute to a friendly community by being themselves and not just random horny strangers on the internet. The Hypnolounge is a place of discussion and rapport, not a place for random hookups like Grindr. There is another server, Hypnosis for Guys, where they would rather just get on with the hypnosis and do nothing else. We think you would be a much better fit there: https://hypnosisforguys.com/",
            "incomplete": "You have failed to read the rules properly and have missed a step in the application procedure that is clearly stated in the rules. Feel free to try again, but we are denying you for now. ({})".format(
                invite_link
            ),
            "closed": "The ticket has been closed.",
        }

        ticket = db.get_ticket_by_channel(Ticket(channel=interaction.channel.id))

        # user
        user = interaction.guild.get_member(ticket.userID)
        if user is None:
            user = bot.get_user(ticket.userID)

        # msg for reason
        msg = reasons[self.reason]
        if len(self.comment.value):
            msg = msg + "\n**Comment**\n{}".format(self.comment.value)

        # embed
        log_embed = discord.Embed(
            title="{} Ticket Closed".format(ticket.type.capitalize()),
            color=discord.Color.blurple(),
        )
        log_embed.add_field(
            name="ID",
            value=ticket.id,
        )
        log_embed.add_field(name="Opened By", value=user.mention if user else "Unknown")
        log_embed.add_field(name="Closed by", value=interaction.user.mention)
        log_embed.add_field(name="Reason", value=msg, inline=False)

        # send embed
        try:
            await user.send(embed=log_embed)
        except:
            None
        await ticket_log(log_embed)

        # kick or accepted
        if user:
            if self.reason == "approved":
                accepted = interaction.guild.get_role(accepted_role)
                await user.add_roles(accepted, reason="The user was approved.")
            elif self.reason == "denied":
                await user.ban(reason="The user was denied.")

        ticket.closed = datetime.datetime.now().timestamp()
        ticket.reason = self.reason
        await interaction.followup.send("Closing....")
        await delete_ticket_channel(ticket)


class DefaultCloseView(discord.ui.View):
    @discord.ui.button(label="Close", style=discord.ButtonStyle.red)
    async def close(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.send_modal(DefaultCloseModal())


class DefaultCloseModal(discord.ui.Modal, title="Close Ticket"):
    comment = discord.ui.TextInput(
        label="Comment", required=False, style=discord.TextStyle.long
    )

    async def on_submit(self, interaction: discord.Interaction):
        await interaction.response.defer(thinking=True)
        ticket = db.get_ticket_by_channel(Ticket(channel=interaction.channel.id))

        # user
        user = interaction.guild.get_member(ticket.userID)
        if user is None:
            user = bot.get_user(ticket.userID)

        # msg
        msg = "The ticket has been closed."
        if len(self.comment.value):
            msg = msg + "\n**Comment**\n{}".format(self.comment.value)

        # embed
        log_embed = discord.Embed(
            title="{} Ticket Closed".format(ticket.type.capitalize()),
            color=discord.Color.blurple(),
        )
        log_embed.add_field(name="ID", value=ticket.id)
        log_embed.add_field(name="Opened By", value=user.mention if user else "Unknown")
        log_embed.add_field(name="Closed by", value=interaction.user.mention)
        log_embed.add_field(name="Reason", value=msg)

        # send embed
        try:
            await user.send(embed=log_embed)
        except:
            None
        await ticket_log(log_embed)

        ticket.closed = datetime.datetime.now().timestamp()
        ticket.reason = "closed"
        await interaction.followup.send("Closing....")
        await delete_ticket_channel(ticket)


# stats


def build_locktober_embeds():
    guild = bot.get_guild(hypnolounge_guild_id)
    counter = 0
    timestamp = datetime.datetime.today()
    embed = discord.Embed(
        colour=discord.Colour.magenta(),
        title="Locktober Boys",
        description="Good luck boys, show us how horny you can be 😉",
        timestamp=timestamp,
    )

    embed.set_footer(text="PupNicky")

    for member in guild.members:
        if not member.bot:
            if member.get_role(locktober_role):
                counter += 1

    embed.add_field(name="Total", value=counter)

    return embed


def build_stats_embeds():
    embeds = {"primary": [], "continent": [], "sessions": []}

    timestamp = datetime.datetime.today()

    role_stats = {}
    guild = bot.get_guild(hypnolounge_guild_id)

    primary_roles = {
        "hypnotist": discord.Colour.red(),
        "switch": discord.Colour.gold(),
        "subject": discord.Colour.green(),
        "undecided": discord.Colour.dark_gray(),
        # "locktober": discord.Colour.magenta(),
    }
    continent_roles = [
        "Africa",
        "Asia",
        "Europe",
        "North America",
        "Oceania",
        "South America",
    ]

    for role in guild.roles:
        if role.name != "@everyone":
            role_stats[role.name] = {"total": 0, "online": 0}

    status = [discord.Status.online, discord.Status.idle, discord.Status.dnd]
    for member in guild.members:
        if not member.bot:
            for role in member.roles:
                if role.name != "@everyone":
                    role_stats[role.name]["total"] += 1
                    if member.status in status:
                        role_stats[role.name]["online"] += 1

    embeds["primary"].append(discord.Embed(title="Primary Roles"))

    # primary:
    for role, colour in primary_roles.items():
        embed = discord.Embed(colour=colour)
        embed.add_field(
            name=role,
            value="Total: {}\nOnline: {}".format(
                role_stats[role]["total"], role_stats[role]["online"]
            ),
        )
        embeds["primary"].append(embed)

    # continent:

    embeds["continent"].append(discord.Embed(title="Continent Roles"))

    for continent in continent_roles:
        embed = discord.Embed(colour=discord.Colour.dark_gold())
        embed.add_field(
            name=continent,
            value="Total: {}\nOnline: {}".format(
                role_stats[continent]["total"], role_stats[continent]["online"]
            ),
        )
        embeds["continent"].append(embed)

    # weekly:

    weekly_embed = discord.Embed(
        title="Session Counter",
        color=discord.Color.blurple(),
        timestamp=timestamp,
    )

    weekly_embed.add_field(
        name="Total Sessions",
        value=db.get_total_sessions(),
        inline=True,
    )

    weekly_embed.add_field(
        name="Weekly Sessions",
        value=db.get_last_weeks_sessions(),
        inline=True,
    )

    weekly_embed.set_footer(text="HypnoloungeBot")

    embeds["sessions"].append(weekly_embed)

    return embeds


# info


async def build_home_view_embed(inter, o_user=None):
    user = inter.user
    if o_user:
        user = o_user

    isMember = bool(user.get_role(member_role))
    mem_msg = "This user is a full member of the Hypnolounge."
    if not isMember:
        mem_msg = "This user is not a member of the Hypnolounge."

    info_embed = discord.Embed(color=discord.Color.blurple(), description=user.mention)

    info_embed.add_field(name="Is Member?", value=mem_msg, inline=False)

    intro_url = "No intro has been found!"
    intro = await get_user_intro(user)
    if bool(intro):
        intro_url = intro.jump_url

    info_embed.add_field(name="Intro", value=intro_url, inline=False)

    if o_user:
        info_embed.add_field(
            name="Strikes",
            value=len(db.get_strikes_by_userid(Strike(userID=user.id))),
            inline=False,
        )

    return info_embed


def build_compliments_view_embed(inter, page, o_user=None):
    user = inter.user
    if o_user:
        user = o_user

    id = user.id
    if id is None:
        time.sleep(1)
        id = user.id

    compliments = db.get_compliments_by_userid(
        Compliment(give=user.id, receive=user.id)
    )
    lastpage = False
    embed = discord.Embed(
        title="Here are all the compliments {}".format(user.name),
        color=discord.Color.blurple(),
    )
    embed.set_footer(text="PupNicky")
    page_size = 5
    start = (page - 1) * page_size
    end = start + page_size
    page_items = compliments[start:end]
    lastpage = end >= len(compliments)

    if len(page_items) > 0:
        for compliment in page_items:
            text = ""
            if compliment.give == user.id:
                second = db.get_user_by_id(User(userID=compliment.receive))
                if second is not None:
                    text = "You have given a compliment to {}".format(
                        second.displayname
                    )
                else:
                    guild = bot.get_guild(hypnolounge_guild_id)
                    user = guild.get_member(compliment.receive)
                    if user is not None:
                        text = "You have given a compliment to {}".format(
                            user.display_name
                        )
                        createUser(user)
                    else:
                        text = "You have given a compliment to UNKNOWN"
            else:
                second = db.get_user_by_id(User(userID=compliment.give))
                if second is not None:
                    text = "You have gotten a compliment from {}".format(
                        second.displayname
                    )
                else:
                    guild = bot.get_guild(hypnolounge_guild_id)
                    user = guild.get_member(compliment.receive)
                    if user is not None:
                        text = "You have gotten a compliment from {}".format(
                            user.display_name
                        )
                        createUser(user)
                    else:
                        text = "You have gotten a compliment from UNKNOWN"

            if len(compliment.comment) > 0:
                text += "\n Comment:\n{}".format(compliment.comment)

            embed.add_field(
                name="ID: {}".format(compliment.id), value=text, inline=False
            )
    else:
        embed.description = "You haven't received or given any compliments yet 😢"

    return embed, lastpage


def build_strikes_view_embed(inter):
    user = inter.user
    strikes = db.get_strikes_by_userid(Strike(userID=user.id))
    embed = discord.Embed(
        title="Here are all your strikes {}".format(user.name),
        color=discord.Color.blurple(),
    )
    embed.set_footer(text="PupNicky")

    if len(strikes) > 0:
        for strike in strikes:
            embed.add_field(
                name="ID: {}".format(strike.id),
                value="Reason: {}\nSeverity: {}".format(strike.reason, strike.severity),
            )
    else:
        embed.description = "You don't have any strikes yet. Good job 🤗"

    return embed


def build_fireboard_view_embed(inter, o_user=None):
    user = inter.user

    embed = discord.Embed(
        title="Here are all your fireboard stats {}".format(user.name),
        colour=discord.Color.blurple(),
        description="This is still WIP sorry 😢.",
    )

    return embed


def build_session_view_embed(inter, o_user=None):
    user = inter.user
    if o_user:
        user = o_user
    sessions = db.get_sessions_by_userid(Session(userID=user.id))

    embed = discord.Embed(
        title="Here are all the session stats {}".format(user.name),
        colour=discord.Color.blurple(),
    )
    embed.set_footer(text="PupNicky")

    if len(sessions) > 0:
        data = {}
        medium = {"total", "text", "voice", "video", "person"}
        for m in medium:
            data[m] = 0

        for session in sessions:
            data["total"] += 1
            data[session.medium] += 1

        embed.add_field(name="Total Sessions", value=data.pop("total"))
        for k, v in data.items():
            embed.add_field(
                name="{} Sessions".format(k.capitalize()), value=v, inline=False
            )
    else:
        embed.description = "There aren't any registered sessions yet 😢"

    return embed


class InfoView(discord.ui.View):
    @discord.ui.button(label="Someone else", style=discord.ButtonStyle.blurple)
    async def user_info(
        self, interaction: discord.Interaction, button: discord.ui.Button
    ):
        await interaction.response.send_modal(InfoModal())

    @discord.ui.button(label="Yourself", style=discord.ButtonStyle.blurple)
    async def self_info(
        self, interaction: discord.Interaction, button: discord.ui.Button
    ):
        await interaction.response.defer(thinking=True, ephemeral=True)
        embed = await build_home_view_embed(interaction)
        await interaction.followup.send(
            embed=embed, view=StatsViewHome(), ephemeral=True
        )


class InfoModal(discord.ui.Modal, title="Get a users info"):
    username = discord.ui.TextInput(label="Username", required=True)

    async def on_submit(self, interaction: discord.Interaction):
        await interaction.response.defer(thinking=True, ephemeral=True)
        username = self.username.value
        if len(username) > 0:
            found_user = user_by_name(interaction, username)
            if found_user is not None:
                embed = await build_home_view_embed(interaction, o_user=found_user)
                await interaction.followup.send(
                    embed=embed, view=StatsViewHome(o_user=found_user), ephemeral=True
                )
                await log(
                    "The User {} requested information on {}".format(
                        interaction.user.mention, found_user.mention
                    ),
                    title="Info Usage",
                )
            else:
                await interaction.followup.send(
                    "The username or nickname you entered wasn't correct: {}".format(
                        username
                    ),
                    ephemeral=True,
                )


class StatsViewHome(discord.ui.View):
    def __init__(self, o_user=None):
        super().__init__()
        self.o_user = o_user
        if o_user:
            self.children[2].disabled = True

    @discord.ui.button(label="Compliments", style=discord.ButtonStyle.blurple)
    async def compliments(
        self, interaction: discord.Interaction, button: discord.ui.Button
    ):
        embed, lastpage = build_compliments_view_embed(
            interaction, 1, o_user=self.o_user
        )
        await interaction.response.edit_message(
            embed=embed,
            view=StatsViewCompliments(page=1, lastpage=lastpage, o_user=self.o_user),
        )

    @discord.ui.button(label="Fireboard", style=discord.ButtonStyle.blurple)
    async def fireboard(
        self, interaction: discord.Interaction, button: discord.ui.Button
    ):
        await interaction.response.edit_message(
            embed=build_fireboard_view_embed(interaction, o_user=self.o_user),
            view=StatsViewFireboard(o_user=self.o_user),
        )

    @discord.ui.button(label="Strikes", style=discord.ButtonStyle.blurple)
    async def strikes(
        self, interaction: discord.Interaction, button: discord.ui.Button
    ):
        await interaction.response.edit_message(
            embed=build_strikes_view_embed(interaction), view=StatsViewStrikes()
        )

    @discord.ui.button(label="Session", style=discord.ButtonStyle.blurple)
    async def session(
        self, interaction: discord.Interaction, button: discord.ui.Button
    ):
        await interaction.response.edit_message(
            embed=build_session_view_embed(interaction, o_user=self.o_user),
            view=StatsViewSession(o_user=self.o_user),
        )


class StatsViewCompliments(discord.ui.View):
    def __init__(self, page, lastpage, o_user):
        super().__init__()
        self.page = page
        self.children[0].disabled = page == 1
        self.children[1].disabled = lastpage
        self.o_user = o_user

    @discord.ui.button(label="◀", style=discord.ButtonStyle.blurple)
    async def previous(
        self, interaction: discord.Interaction, button: discord.ui.Button
    ):
        self.page -= 1
        embed, lastpage = build_compliments_view_embed(
            interaction, self.page, o_user=self.o_user
        )
        await interaction.response.edit_message(
            embed=embed,
            view=StatsViewCompliments(self.page, lastpage, o_user=self.o_user),
        )

    @discord.ui.button(label="▶", style=discord.ButtonStyle.blurple)
    async def next(self, interaction: discord.Interaction, button: discord.ui.Button):
        self.page += 1
        embed, lastpage = build_compliments_view_embed(
            interaction, self.page, o_user=self.o_user
        )
        await interaction.response.edit_message(
            embed=embed,
            view=StatsViewCompliments(self.page, lastpage, o_user=self.o_user),
        )

    @discord.ui.button(label="❌", style=discord.ButtonStyle.blurple)
    async def back(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.edit_message(
            embed=await build_home_view_embed(interaction, o_user=self.o_user),
            view=StatsViewHome(o_user=self.o_user),
        )


class StatsViewStrikes(discord.ui.View):
    @discord.ui.button(label="❌", style=discord.ButtonStyle.blurple)
    async def back(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.edit_message(
            embed=await build_home_view_embed(interaction), view=StatsViewHome()
        )


class StatsViewFireboard(discord.ui.View):
    def __init__(self, o_user=None):
        super().__init__()
        self.o_user = o_user

    @discord.ui.button(label="❌", style=discord.ButtonStyle.blurple)
    async def back(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.edit_message(
            embed=await build_home_view_embed(interaction, o_user=self.o_user),
            view=StatsViewHome(o_user=self.o_user),
        )


class StatsViewSession(discord.ui.View):
    def __init__(self, o_user=None):
        super().__init__()
        self.o_user = o_user

    @discord.ui.button(label="❌", style=discord.ButtonStyle.blurple)
    async def back(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.edit_message(
            embed=await build_home_view_embed(interaction, o_user=self.o_user),
            view=StatsViewHome(o_user=self.o_user),
        )


# strike


def build_strikes_embed(user):
    strikes = db.get_strikes_by_userid(Strike(userID=user.id))
    embed = discord.Embed(
        title="Strikes of user {}".format(user.name),
        color=discord.Color.blurple(),
    )
    embed.set_footer(text="PupNicky")
    if len(strikes) > 0:
        for strike in strikes:
            embed.add_field(
                name="ID: {}".format(strike.id),
                value="Reason: {}\nSeverity: {}".format(strike.reason, strike.severity),
            )
    else:
        embed.description = "The user doesn't have any strikes yet."

    return embed


class StrikeView(discord.ui.View):
    @discord.ui.button(label="Give a strike 😠", style=discord.ButtonStyle.blurple)
    async def give_strike(
        self, interaction: discord.Interaction, button: discord.ui.Button
    ):
        await interaction.response.send_modal(GiveStrikeModal())

    @discord.ui.button(label="User Strikes", style=discord.ButtonStyle.blurple)
    async def get_strike(
        self, interaction: discord.Interaction, button: discord.ui.Button
    ):
        await interaction.response.send_modal(GetStrikeModal())

    @discord.ui.button(label="Delete Strikes", style=discord.ButtonStyle.blurple)
    async def delete_strike(
        self, interaction: discord.Interaction, button: discord.ui.Button
    ):
        await interaction.response.send_modal(DeleteStrikeModal())


class GiveStrikeModal(discord.ui.Modal, title="Give a strike"):
    username = discord.ui.TextInput(label="Username", required=True)
    reason = discord.ui.TextInput(
        label="Reason", style=discord.TextStyle.paragraph, required=True
    )

    async def on_submit(self, interaction: discord.Interaction):
        username = self.username.value
        found_user = user_by_name(interaction, username)
        if found_user:
            id = db.add_strike(Strike(userID=found_user.id, reason=self.reason.value))
            await interaction.response.send_message(
                "You gave {} a strike 😤 (ID:{})".format(found_user.display_name, id),
                ephemeral=True,
            )
        else:
            await interaction.response.send_message(
                "The username or nickname you entered wasn't correct: {}".format(
                    username
                ),
                ephemeral=True,
            )


class DeleteStrikeModal(discord.ui.Modal, title="Delete a strike"):
    strike_id = discord.ui.TextInput(
        label="Id", required=True, min_length=1, max_length=5
    )

    async def on_submit(self, interaction: discord.Interaction):
        try:
            number = int(self.strike_id.value)
            db.rm_strike(Strike(id=number))
            await interaction.response.send_message(
                "Strike {} has been deleted!".format(number), ephemeral=True
            )
        except ValueError:
            await interaction.response.send_message(
                "The given strike isn't a number: {}".format(self.id), ephemeral=True
            )


class GetStrikeModal(discord.ui.Modal, title="Get user strikes"):
    username = discord.ui.TextInput(label="Username", required=True)

    async def on_submit(self, interaction: discord.Interaction):
        username = self.username.value
        found_user = user_by_name(interaction, username)
        if found_user:
            await interaction.response.send_message(
                "Here are the strikes for {}".format(found_user.display_name),
                embed=build_strikes_embed(found_user),
                ephemeral=True,
            )
        else:
            await interaction.response.send_message(
                "The username or nickname you entered wasn't correct: {}".format(
                    username
                ),
                ephemeral=True,
            )


# survey


class SurveyView(discord.ui.View):
    @discord.ui.button(label="🗒️ Text", style=discord.ButtonStyle.blurple)
    async def text(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.send_modal(ComplimentModal(type="text"))

    @discord.ui.button(label="☎️ Voice", style=discord.ButtonStyle.blurple)
    async def voice(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.send_modal(ComplimentModal(type="voice"))

    @discord.ui.button(label="🎞️ Video", style=discord.ButtonStyle.blurple)
    async def video(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.send_modal(ComplimentModal(type="video"))

    @discord.ui.button(label="👬 In person", style=discord.ButtonStyle.blurple)
    async def person(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.send_modal(ComplimentModal(type="person"))


class ComplimentModal(discord.ui.Modal, title="Give a Compliment"):
    username = discord.ui.TextInput(label="other's person username", required=False)
    comment = discord.ui.TextInput(
        label="Compliment", style=discord.TextStyle.paragraph, required=False
    )

    def __init__(self, type, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.type = type

    async def on_submit(self, interaction: discord.Interaction):
        type = self.type
        channel = bot.get_channel(compliment_channel_id)
        username = self.username.value
        if len(username) > 0:
            found_user = user_by_name(interaction, username)
            if found_user is not None:
                if found_user.id != interaction.user.id:
                    msg = "{} did a session with {}".format(
                        interaction.user.mention, found_user.mention
                    )
                    if len(self.comment.value):
                        msg = msg + "\n\n>>> {}".format(self.comment.value)
                    await channel.send(msg)
                    await interaction.response.send_message(
                        "You gave {} a compliment 🫰".format(found_user.display_name),
                        ephemeral=True,
                    )
                    db.add_compliment(
                        Compliment(
                            give=interaction.user.id,
                            receive=found_user.id,
                            comment=self.comment.value,
                        )
                    )
                    add_Data(interaction, type)
                else:
                    await interaction.response.send_message(
                        "The username or nickname you entered couldn't be found: {}".format(
                            username
                        ),
                        ephemeral=True,
                    )
            else:
                await interaction.response.send_message(
                    "Thank you for adding your session 🫰", ephemeral=True
                )
        else:
            await interaction.response.send_message(
                "I hope you had fun :smirk:", ephemeral=True
            )
            add_Data(interaction, type)

    username = discord.ui.TextInput(label="Username", required=False)
    comment = discord.ui.TextInput(
        label="Compliment", style=discord.TextStyle.paragraph, required=False
    )
    type = "person"

    async def on_submit(self, interaction: discord.Interaction):
        channel = bot.get_channel(compliment_channel_id)
        username = self.username.value
        if len(username) > 0:
            found_user = user_by_name(interaction, username)
            if found_user is not None:
                if found_user.id != interaction.user.id:
                    msg = "{} did a session with {}".format(
                        interaction.user.mention, found_user.mention
                    )
                    if len(self.comment.value):
                        msg = msg + "\n\n>>> {}".format(self.comment)
                    await channel.send(msg)
                    await interaction.response.send_message(
                        "You gave {} a compliment 🤞".format(found_user.display_name),
                        ephemeral=True,
                    )
                    db.add_compliment(
                        Compliment(
                            give=interaction.user.id,
                            receive=found_user.id,
                            comment=self.comment.value,
                        )
                    )
                    add_Data(interaction, self.type)
                else:
                    await interaction.response.send_message(
                        "You can't give yourself a compliment you silly 🤭",
                        ephemeral=True,
                    )
            else:
                await interaction.response.send_message(
                    "The username or nickname you entered wasn't correct: {}".format(
                        username
                    ),
                    ephemeral=True,
                )
        else:
            await interaction.response.send_message(
                "I hope you had fun :smirk:", ephemeral=True
            )
            add_Data(interaction, self.type)


# roles


class PrimaryRoleView(discord.ui.View):
    @discord.ui.select(
        placeholder="Choose a Primary Role",
        min_values=1,
        max_values=1,
        options=[
            discord.SelectOption(
                label="hypnotist",
                value=1125010023534305321,
                emoji=discord.PartialEmoji.from_str("🔴"),
            ),
            discord.SelectOption(
                label="switch",
                value=1125071348394365038,
                emoji=discord.PartialEmoji.from_str("🟡"),
            ),
            discord.SelectOption(
                label="subject",
                value=1125010083173105674,
                emoji=discord.PartialEmoji.from_str("🟢"),
            ),
            discord.SelectOption(
                label="undecided",
                value=1125071834065404027,
                emoji=discord.PartialEmoji.from_str("⚪"),
            ),
        ],
    )
    async def select_callback(self, interaction, select):
        await interaction.response.defer(thinking=True, ephemeral=True)
        roles = ["hypnotist", "switch", "subject", "undecided"]
        member = interaction.user
        for role in member.roles:
            if role.name in roles:
                await member.remove_roles(role)
        role = interaction.guild.get_role(int(select.values[0]))

        user = db.get_user_by_id(User(userID=member.id))
        if user is not None:
            db.update_user(
                User(
                    member.id,
                    member.name,
                    member.display_name,
                    role.name,
                    user.continent,
                )
            )
        else:
            createUser(member)

        await member.add_roles(role)
        await interaction.followup.send("You got the role.", ephemeral=True)


class ContinentRoleView(discord.ui.View):
    @discord.ui.select(
        placeholder="Choose a Continent",
        min_values=1,
        max_values=1,
        options=[
            discord.SelectOption(
                label="Africa",
                value=1125838253501718528,
                emoji=discord.PartialEmoji.from_str("<:africa:1125489351841824869>"),
            ),
            discord.SelectOption(
                label="Asia",
                value=1125838333231239298,
                emoji=discord.PartialEmoji.from_str("<:asia:1125489375279587398>"),
            ),
            discord.SelectOption(
                label="Europe",
                value=1125835692346449941,
                emoji=discord.PartialEmoji.from_str("<:europe:1125489356514275358>"),
            ),
            discord.SelectOption(
                label="North America",
                value=1125835502277369967,
                emoji=discord.PartialEmoji.from_str(
                    "<:north_america:1125489359307681892>"
                ),
            ),
            discord.SelectOption(
                label="Oceania",
                value=1125836555186094200,
                emoji=discord.PartialEmoji.from_str(
                    "<:oceania_australia:1125489347563622670>"
                ),
            ),
            discord.SelectOption(
                label="South America",
                value=1125835613300588545,
                emoji=discord.PartialEmoji.from_str(
                    "<:south_america:1125489363577471087>"
                ),
            ),
        ],
    )
    async def select_callback(self, interaction, select):
        await interaction.response.defer(thinking=True, ephemeral=True)
        roles = [
            "Africa",
            "Asia",
            "Europe",
            "North America",
            "Oceania",
            "South America",
        ]
        member = interaction.user
        for role in member.roles:
            if role.name in roles:
                await member.remove_roles(role)
        role = interaction.guild.get_role(int(select.values[0]))

        user = db.get_user_by_id(User(userID=member.id))
        if user is not None:
            db.update_user(
                User(
                    member.id, member.name, member.display_name, user.primary, role.name
                )
            )
        else:
            createUser(member)

        await member.add_roles(role)
        await interaction.followup.send("You got the role.", ephemeral=True)


class SessionRoleView(discord.ui.View):
    @discord.ui.select(
        placeholder="Choose if open to session",
        min_values=1,
        max_values=1,
        options=[
            discord.SelectOption(
                label="open to sessions",
                value=1125492372436959363,
                emoji=discord.PartialEmoji.from_str("✅"),
            ),
            discord.SelectOption(
                label="may be open to sessions",
                value=1143277273743638660,
                emoji=discord.PartialEmoji.from_str("🤷‍♂️"),
            ),
            discord.SelectOption(
                label="not open to sessions",
                value=1125492444264403045,
                emoji=discord.PartialEmoji.from_str("❌"),
            ),
        ],
    )
    async def select_callback(self, interaction, select):
        await interaction.response.defer(thinking=True, ephemeral=True)
        roles = ["open to sessions", "not open to sessions", "may be open to sessions"]
        member = interaction.user
        for role in member.roles:
            if role.name in roles:
                await member.remove_roles(role)
        role = interaction.guild.get_role(int(select.values[0]))
        await member.add_roles(role)
        await interaction.followup.send("You got the role.", ephemeral=True)


class DMRoleView(discord.ui.View):
    @discord.ui.select(
        placeholder="Choose if open to dm",
        min_values=1,
        max_values=1,
        options=[
            discord.SelectOption(
                label="Open to DMs",
                value=1126195216567783454,
                emoji=discord.PartialEmoji.from_str("✉️"),
            ),
            discord.SelectOption(
                label="Ask to DM",
                value=1126195136292995143,
                emoji=discord.PartialEmoji.from_str("🚫"),
            ),
        ],
    )
    async def select_callback(self, interaction, select):
        await interaction.response.defer(thinking=True, ephemeral=True)
        roles = ["Open to DMs", "Ask to DM"]
        member = interaction.user
        for role in member.roles:
            if role.name in roles:
                await member.remove_roles(role)
        role = interaction.guild.get_role(int(select.values[0]))
        await member.add_roles(role)
        await interaction.followup.send("You got the role.", ephemeral=True)


# func


def add_Data(ctx: discord.Interaction, medium):
    user = ctx.user
    if db.get_user_by_id(User(userID=user.id)) is None:
        createUser(user)
    timestamp = datetime.datetime.now().timestamp()
    db.add_session(Session(userID=user.id, medium=medium, date=timestamp))


def get_primary_role(user):
    roles = user.roles
    primary = {
        1125010023534305321,
        1125071348394365038,
        1125010083173105674,
        1125071834065404027,
    }
    for role in roles:
        if role.id in primary:
            return role.name
    return "None"


def get_continent_role(user):
    roles = user.roles
    continent = {
        1125838253501718528,
        1125838333231239298,
        1125835692346449941,
        1125835502277369967,
        1125836555186094200,
        1125835613300588545,
    }
    for role in roles:
        if role.id in continent:
            return role.name
    return "None"


def createUser(user):
    primary_role = get_primary_role(user)
    continent_role = get_continent_role(user)
    db.add_user(
        User(user.id, user.name, user.display_name, primary_role, continent_role)
    )


def user_by_name(interaction, name):
    username = re.sub(r"[@]", "", name)
    for member in interaction.guild.members:
        if (
            username.lower() == member.display_name.lower()
            or username.lower() == member.name.lower()
        ):
            return member
    return None


async def get_user_intro(user):
    channel = bot.get_channel(intro_channel_id)
    intro = db.get_intro_by_userid(Intro(userID=user.id))
    if bool(intro):
        try:
            message = await channel.fetch_message(intro.message)
            return message
        except discord.NotFound:
            None

    async for message in channel.history(limit=None):
        if message.author.id == user.id:
            if db.get_user_by_id(User(userID=message.author.id)) is None:
                createUser(message.author)
            db.add_intro(Intro(message.author.id, message.id, message.content))
            return message
    return None


async def log(msg, title="Log", type="info", o_embed=None):
    color = {
        "info": discord.Color.blurple(),
        "warning": discord.Color.yellow(),
        "error": discord.Color.red(),
    }
    embed = discord.Embed(title=title, description=msg, color=color[type])
    embed.set_footer(text="PupNicky")

    if o_embed:
        embed = o_embed

    await system_log_channel.send(embed=embed)


async def ticket_log(embed):
    await ticket_log_channel.send(embed=embed)


# end of file

bot.run(token)
