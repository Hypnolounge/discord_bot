import { Client } from "discord.js";
import getChannel from "./utils/getChannel";
import { log_error } from "./utils/error";
import AutoDelete from "./class/autodelete";

export default function AutoDeletes(client: Client) {
  IntroAutoDelete(client);
  NSFWAutoDelete(client);
}

async function IntroAutoDelete(client: Client) {
  const channel = await getChannel("1197883681117835335");

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
}

async function NSFWAutoDelete(client: Client) {
  const channel = await getChannel("1248249254569443399");

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