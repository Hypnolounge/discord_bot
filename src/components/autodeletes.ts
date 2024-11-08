import { updateUser } from "@db/user";
import { Message } from "discord.js";
import AutoDelete from "../class/autodelete";
import config from "../db/config";
import { log_error } from "../utils/error";
import getChannel from "../utils/getChannel";

export default function AutoDeletes() {
  IntroAutoDelete();
  SFWAutoDelete();
  NSFWAutoDelete();
  HOCAutoDelete();
  HRCAutoDelete();
  FilesAutoDelete();
}

async function IntroAutoDelete() {
  try {
    const channel = await getChannel(config.channels.intros);

    const introAutoDelete = new AutoDelete(
      channel,
      "Your intro is too short, say more.😥 You can post another intro in 6 hours.",
      undefined,
      100
    );

    introAutoDelete.init();

    introAutoDelete.on("messagePassed", async (message: Message) => {
      if (!message.member) return;
      await message.member.roles.add(config.roles.member);
      updateUser(message.member);
    });
  } catch (error) {
    log_error(error);
  }
}

async function SFWAutoDelete() {
  try {
    const channel = await getChannel(config.channels.sfw_selfies);

    const sfwAutoDelete = new AutoDelete(
      channel,
      "Your post in {{channelURL}} was deleted because it did not contain a media file.",
      true
    );

    sfwAutoDelete.init();
  } catch (error) {
    log_error(error);
  }
}

async function NSFWAutoDelete() {
  try {
    const channel = await getChannel(config.channels.nsfw_selfies);

    const nsfwAutoDelete = new AutoDelete(
      channel,
      "Your post in {{channelURL}} was deleted because it did not contain a media file.",
      true
    );

    nsfwAutoDelete.init();
  } catch (error) {
    log_error(error);
  }
}

async function HOCAutoDelete() {
  try {
    const channel = await getChannel(config.channels.hypno_oc);

    const hocAutoDelete = new AutoDelete(
      channel,
      "Your post in {{channelURL}} was deleted because it did not contain a media file.",
      true
    );

    hocAutoDelete.init();
  } catch (error) {
    log_error(error);
  }
}

async function HRCAutoDelete() {
  try {
    const channel = await getChannel(config.channels.hypno_rc);

    const hrcAutoDelete = new AutoDelete(
      channel,
      "Your post in {{channelURL}} was deleted because it did not contain a media file.",
      true
    );

    hrcAutoDelete.init();
  } catch (error) {
    log_error(error);
  }
}

async function FilesAutoDelete() {
  try {
    const channel = await getChannel(config.channels.files);

    const filesAutoDelete = new AutoDelete(
      channel,
      "Your post in {{channelURL}} was deleted because it did not contain a media file.",
      true
    );

    filesAutoDelete.init();
  } catch (error) {
    log_error(error);
  }
}
