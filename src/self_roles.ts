import { Client } from "discord.js";
import {
  SelfRole,
  SelfRoleCorrelation,
  SelfRoleSelectorMulti,
  SelfRoleSelectorSingle,
} from "./class/selfrole";
import getChannel from "./utils/getChannel";
import { log_error } from "./utils/error";
import { getKeyValue } from "./DB/keyValueStore";

export default function SelfRoles(client: Client) {
  PrimaryRoles(client);
  LookingForSession(client);
  LookingForNotification(client);
}

async function PrimaryRoles(client: Client) {
  const channel = await getChannel("1248249254569443399");

  if (!channel || !channel.isTextBased()) {
    log_error("Channel not found");
    return;
  }

  const hypnotistRole = new SelfRole("1125010023534305321", "hypnotist", "🔴");

  const switchRole = new SelfRole("1125071348394365038", "switch", "🟡");

  const subRole = new SelfRole("1125010083173105674", "subject", "🟢");

  const undecidedRole = new SelfRole("1125071834065404027", "undecided", "⚪");

  const name = "primary_role_selector";

  const primarySelector = new SelfRoleSelectorSingle(
    client,
    name,
    "Primary Role",
    [hypnotistRole, switchRole, subRole, undecidedRole],
    await getKeyValue(name),
    channel,
    "Select your primary role",
    "Choose a primary role here. Without a primary role, you will not have access to the rest of the server."
  );

  await primarySelector.init();
}

async function LookingForSession(client: Client) {
  const channel = await getChannel("1248249254569443399");

  if (!channel || !channel.isTextBased()) {
    log_error("Channel not found");
    return;
  }

  const open = new SelfRole("1125492372436959363", "open for sessions", "✅");
  const maybe = new SelfRole(
    "1143277273743638660",
    "may be open for sessions",
    "🤷‍♂️"
  );
  const closed = new SelfRole(
    "1125492444264403045",
    "not open for sessions",
    "❌"
  );

  const lookingForSelector = new SelfRoleSelectorSingle(
    client,
    "looking_for_selector",
    "Looking For Sessions",
    [open, maybe, closed],
    "1248250218022178900",
    channel,
    "Choose if open for sessions",
    "Choose if you are open for sessions or not"
  );

  await lookingForSelector.init();
}

async function LookingForNotification(client: Client) {
  const channel = await getChannel("1248249254569443399");

  if (!channel || !channel.isTextBased()) {
    log_error("Channel not found");
    return;
  }

  const correlation = {
    "1125010023534305321": "1156298225523896321", // looking-for-tist
    "1125071348394365038": "1156298728475476018", // looking-for-switch
    "1125010083173105674": "1156298677695025172", // looking-for-sub
    "1125071834065404027": "1156298728475476018", // looking-for-undecided
  };

  const looking = new SelfRoleCorrelation(
    "1125010023534305321",
    "",
    "⌚",
    correlation
  );

  const lookingForSelector = new SelfRoleSelectorMulti(
    client,
    "looking_for_notification_selector",
    "looking-for Notifications",
    [looking],
    "1248250227627135067",
    channel,
    `If you have this role, you will receive notifications every time someone messages in one of the looking-for channels relevant to your primary role:
      hypnotists get notifications from looking-for-tists
      subs get notifications from looking-for-subs
      switches and undecideds get notifications from both`
  );

  await lookingForSelector.init();
}
