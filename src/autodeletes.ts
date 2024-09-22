import { updateUser } from "@db/user";
import { Client, Message } from "discord.js";
import AutoDelete from "./class/autodelete";
import config from "./db/config";
import { log_error } from "./utils/error";
import getChannel from "./utils/getChannel";

export default function AutoDeletes(client: Client) {
  IntroAutoDelete(client);
  SFWAutoDelete(client);
  NSFWAutoDelete(client);
  HOCAutoDelete(client);
  HRCAutoDelete(client);
  FilesAutoDelete(client);
}

async function IntroAutoDelete(client: Client) {
  const channel = await getChannel(config.channels.intros);

  if (!channel || !channel.isTextBased()) {
    log_error("Channel not found");
    return;
  }

  const introAutoDelete = new AutoDelete(
    client,
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
}

async function SFWAutoDelete(client: Client) {
  const channel = await getChannel(config.channels.sfw_selfies);

  if (!channel || !channel.isTextBased()) {
    log_error("Channel not found");
    return;
  }

  const sfwAutoDelete = new AutoDelete(
    client,
    channel,
    "Your post in {{channelURL}} was deleted because it did not contain a media file.",
    true
  );

  sfwAutoDelete.init();
}

async function NSFWAutoDelete(client: Client) {
  const channel = await getChannel(config.channels.nsfw_selfies);

  if (!channel || !channel.isTextBased()) {
    log_error("Channel not found");
    return;
  }

  const nsfwAutoDelete = new AutoDelete(
    client,
    channel,
    "Your post in {{channelURL}} was deleted because it did not contain a media file.",
    true
  );

  nsfwAutoDelete.init();
}

async function HOCAutoDelete(client: Client) {
  const channel = await getChannel(config.channels.hypno_oc);

  if (!channel || !channel.isTextBased()) {
    log_error("Channel not found");
    return;
  }

  const hocAutoDelete = new AutoDelete(
    client,
    channel,
    "Your post in {{channelURL}} was deleted because it did not contain a media file.",
    true
  );

  hocAutoDelete.init();
}

async function HRCAutoDelete(client: Client) {
  const channel = await getChannel(config.channels.hypno_rc);

  if (!channel || !channel.isTextBased()) {
    log_error("Channel not found");
    return;
  }

  const hrcAutoDelete = new AutoDelete(
    client,
    channel,
    "Your post in {{channelURL}} was deleted because it did not contain a media file.",
    true
  );

  hrcAutoDelete.init();
}

async function FilesAutoDelete(client: Client) {
  const channel = await getChannel(config.channels.files);

  if (!channel || !channel.isTextBased()) {
    log_error("Channel not found");
    return;
  }

  const filesAutoDelete = new AutoDelete(
    client,
    channel,
    "Your post in {{channelURL}} was deleted because it did not contain a media file.",
    true
  );

  filesAutoDelete.init();
}
