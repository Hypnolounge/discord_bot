import { Client } from "discord.js";
import getChannel from "./utils/getChannel";
import { log_error } from "./utils/error";
import { BoostAnnouncement, Announcement } from "./class/announcement";
import config from "./DB/config";
import getRole from "./utils/getRole";

export default function Announcements(client: Client) {
  //BoostAnnounce(client);
  //HOCAnnounce(client);
  //LookingForTistAnnounce(client);
  //LookingForSubAnnounce(client);
}

async function BoostAnnounce(client: Client) {
  const channel = await getChannel(config.channels.announcements);

  if (!channel || !channel.isTextBased()) {
    log_error("Boost channel not found");
    return;
  }

  const boostMessage = new BoostAnnouncement(
    client,
    channel,
    "Thank you {{user}} for boosting the Hypnolounge! I love you ❤️"
  );

  boostMessage.init();
}

async function HOCAnnounce(client: Client) {
  const channel = await getChannel(config.channels.hypno_oc);

  if (!channel || !channel.isTextBased()) {
    log_error("HOC channel not found");
    return;
  }

  const hocRole = await getRole(config.roles.hoc);

  if (!hocRole) {
    log_error("HOC role not found");
    return;
  }

  const hocMessage = new Announcement(client, channel, [hocRole]);

  hocMessage.init();
}

async function LookingForTistAnnounce(client: Client) {
  const channel = await getChannel(config.channels.looking_for_tist);

  if (!channel || !channel.isTextBased()) {
    log_error("Looking for tist channel not found");
    return;
  }

  const lookingForTistRole = await getRole(config.roles.now_announce.hypnotist);
  const lookingForSwitchRole = await getRole(config.roles.now_announce.switch);

  if (!lookingForTistRole || !lookingForSwitchRole) {
    log_error("Looking for tist roles not found");
    return;
  }

  const lookingForTistMessage = new Announcement(client, channel, [
    lookingForTistRole,
    lookingForSwitchRole,
  ]);

  lookingForTistMessage.init();
}

async function LookingForSubAnnounce(client: Client) {
  const channel = await getChannel(config.channels.looking_for_sub);

  if (!channel || !channel.isTextBased()) {
    log_error("Looking for sub channel not found");
    return;
  }

  const lookingForSubRole = await getRole(config.roles.now_announce.subject);
  const lookingForSwitchRole = await getRole(config.roles.now_announce.switch);

  if (!lookingForSubRole || !lookingForSwitchRole) {
    log_error("Looking for sub roles not found");
    return;
  }

  const lookingForSubMessage = new Announcement(client, channel, [
    lookingForSubRole,
    lookingForSwitchRole,
  ]);

  lookingForSubMessage.init();
}
