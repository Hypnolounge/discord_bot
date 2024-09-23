import { Announcement, BoostAnnouncement } from "@class/announcement";
import config from "@db/config";
import { log_error } from "@utils/error";
import getChannel from "@utils/getChannel";
import getRole from "@utils/getRole";

export default function Announcements() {
  BoostAnnounce();
  HOCAnnounce();
  LookingForTistAnnounce();
  LookingForSubAnnounce();
}

async function BoostAnnounce() {
  try {
    const channel = await getChannel(config.channels.announcements);

    const boostMessage = new BoostAnnouncement(
      channel,
      "Thank you {{user}} for boosting the Hypnolounge! I love you ❤️"
    );

    boostMessage.init();
  } catch (e) {
    log_error(e);
  }
}

async function HOCAnnounce() {
  try {
    const channel = await getChannel(config.channels.hypno_oc);

    const hocRole = await getRole(config.roles.hoc);

    const hocMessage = new Announcement(channel, [hocRole]);

    hocMessage.init();
  } catch (error) {
    log_error(error);
  }
}

async function LookingForTistAnnounce() {
  try {
    const channel = await getChannel(config.channels.looking_for_tist);

    const lookingForTistRole = await getRole(
      config.roles.now_announce.hypnotist
    );
    const lookingForSwitchRole = await getRole(
      config.roles.now_announce.switch
    );

    const lookingForTistMessage = new Announcement(channel, [
      lookingForTistRole,
      lookingForSwitchRole,
    ]);

    lookingForTistMessage.init();
  } catch (error) {
    log_error(error);
  }
}

async function LookingForSubAnnounce() {
  try {
    const channel = await getChannel(config.channels.looking_for_sub);

    const lookingForSubRole = await getRole(config.roles.now_announce.subject);
    const lookingForSwitchRole = await getRole(
      config.roles.now_announce.switch
    );

    const lookingForSubMessage = new Announcement(channel, [
      lookingForSubRole,
      lookingForSwitchRole,
    ]);

    lookingForSubMessage.init();
  } catch (error) {
    log_error(error);
  }
}
