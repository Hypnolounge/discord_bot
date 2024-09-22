import { updateUser } from "@db/user";
import { Client, GuildMember, TextBasedChannel } from "discord.js";
import SelfRoleSelectorMulti from "./class/roles/multiSelector";
import { SelfRole, SelfRoleCorrelation } from "./class/roles/selfrole";
import SelfRoleSelectorSingle from "./class/roles/singleSelector";
import config from "./db/config";
import { log_error } from "./utils/error";
import getChannel from "./utils/getChannel";

let channel: TextBasedChannel;

export default async function SelfRoles(client: Client) {
  const roles = await getChannel(config.channels.roles);
  if (!roles || !roles.isTextBased()) {
    log_error("Roles channel not found");
    return;
  }
  channel = roles;

  await PrimaryRoles(client);
  await LookingForSession(client);
  await LookingForNotification(client);
  await SessionTypes(client);
  await OpenForDMs(client);
  await ContinentRoles(client);
  await Notifications(client);
}

async function PrimaryRoles(client: Client) {
  const hypnotistRole = new SelfRole(
    config.roles.primary.hypnotist,
    "Hypnotist",
    "🔴"
  );
  const switchRole = new SelfRole(config.roles.primary.switch, "Switch", "🟡");
  const subRole = new SelfRole(config.roles.primary.subject, "Subject", "🟢");
  const undecidedRole = new SelfRole(
    config.roles.primary.undecided,
    "Undecided",
    "⚪"
  );

  const primarySelector = new SelfRoleSelectorSingle(
    client,
    "primary_role_selector",
    "Primary Role",
    [hypnotistRole, switchRole, subRole, undecidedRole],
    channel,
    "Select your primary role",
    "Choose a primary role here. Without a primary role, you will not have access to the rest of the server."
  );

  await primarySelector.init();

  primarySelector.on(
    "roleAdded",
    async (role: SelfRole, member: GuildMember) => {
      if (!role) return;
      if (!member) return;

      updateUser(member);
    }
  );
}

async function LookingForSession(client: Client) {
  const open = new SelfRole(
    config.roles.session.open,
    "open for sessions",
    "✅"
  );
  const maybe = new SelfRole(
    config.roles.session.maybe,
    "may be open for sessions",
    "🤷‍♂️"
  );
  const closed = new SelfRole(
    config.roles.session.closed,
    "not open for sessions",
    "❌"
  );

  const lookingForSelector = new SelfRoleSelectorSingle(
    client,
    "looking_for_selector",
    "Looking For Sessions",
    [open, maybe, closed],
    channel,
    "Choose if open for sessions",
    "Choose if you are open for sessions or not"
  );

  await lookingForSelector.init();
}

async function LookingForNotification(client: Client) {
  const correlation = {
    [config.roles.primary.hypnotist]: config.roles.now_announce.hypnotist, // looking-for-tist
    [config.roles.primary.switch]: config.roles.now_announce.switch, // looking-for-switch
    [config.roles.primary.subject]: config.roles.now_announce.subject, // looking-for-sub
    [config.roles.primary.undecided]: config.roles.now_announce.undecided, // looking-for-undecided
  };

  const looking = new SelfRoleCorrelation("", "⌚", correlation);

  const lookingForSelector = new SelfRoleSelectorMulti(
    client,
    "looking_for_notification_selector",
    "looking-for Notifications",
    [looking],
    channel,
    `If you have this role, you will receive notifications every time someone messages in one of the looking-for channels relevant to your primary role:
      hypnotists get notifications from looking-for-tists
      subs get notifications from looking-for-subs
      switches and undecideds get notifications from both`
  );

  await lookingForSelector.init();
}

async function SessionTypes(client: Client) {
  const text = new SelfRole(config.roles.session.text, "text", "🗒️");
  const voice = new SelfRole(config.roles.session.voice, "voice", "☎️");
  const video = new SelfRole(config.roles.session.video, "video", "🎞️");
  const inPerson = new SelfRole(
    config.roles.session.in_person,
    "in person",
    "👬"
  );
  const covert = new SelfRole(
    config.roles.session.covert,
    "covert (People can assume you're ok with covert hypnosis without needing to ask you.)",
    "🫢"
  );

  const sessionTypeSelector = new SelfRoleSelectorMulti(
    client,
    "session_type_selector",
    "Session Type",
    [text, voice, video, inPerson, covert],
    channel
  );

  await sessionTypeSelector.init();
}

async function OpenForDMs(client: Client) {
  const open = new SelfRole(config.roles.dms.open, "Open for DMs", "✉️");
  const ask = new SelfRole(config.roles.dms.ask, "Ask for DM", "🚫");

  const dmSelector = new SelfRoleSelectorSingle(
    client,
    "dm_selector",
    "Open for DMs",
    [open, ask],
    channel,
    "Choose if open for DMs",
    "Choose if your DMs are open or not"
  );

  await dmSelector.init();
}

async function ContinentRoles(client: Client) {
  const roles: SelfRole[] = [];

  for (const continent of config.roles.continent) {
    const role = new SelfRole(continent.role, continent.desc, "");
    roles.push(role);
  }

  const continentSelector = new SelfRoleSelectorSingle(
    client,
    "continent_selector",
    "Continent Role",
    roles,
    channel,
    "Choose a continent",
    "Select the continent you live in."
  );

  await continentSelector.init();

  continentSelector.on(
    "roleAdded",
    async (role: SelfRole, member: GuildMember) => {
      if (!role) return;
      if (!member) return;

      updateUser(member);
    }
  );
}

async function Notifications(client: Client) {
  const announcements = new SelfRole(
    config.roles.announcements,
    "Announcements",
    "📢"
  );
  const hoc = new SelfRole(config.roles.hoc, "HOC", "🌀");
  const gaming = new SelfRole(config.roles.gaming, "Gaming", "🎮");
  const minecraft = new SelfRole(
    config.roles.minecraft,
    "Minecraft",
    "<:creeper:1284881800644132874>"
  );

  const notificationSelector = new SelfRoleSelectorMulti(
    client,
    "notification_selector",
    "Notification Roles",
    [announcements, hoc, gaming, minecraft],
    channel,
    "If you have these roles, every time someone post in its corresponding channel, you will get a notification."
  );

  await notificationSelector.init();
}
