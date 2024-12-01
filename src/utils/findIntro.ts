import config from "@db/config";
import { FetchMessagesOptions } from "node_modules/discord.js/typings";
import getChannel from "./getChannel";

export default async function findIntro(memberID: string) {
  const channel = await getChannel(config.channels.intros);
  let options: FetchMessagesOptions = { limit: 100 };
  let iterations = 0;
  while (true) {
    const intros = await channel.messages.fetch(options);
    const intro = intros.find((msg) => msg.author.id === memberID);
    if (intro) {
      return intro;
    }
    if (intros.size < 100) {
      return undefined;
    }
    if (iterations > 20) {
      throw new Error("Too many iterations in findIntro");
    }

    options.before = intros.last()?.id || "";
    iterations++;
  }
}
