import { TextChannelGroup } from "@typings/TextChannelGroup";
import { log_error } from "@utils/error";
import checkMessage from "@utils/message/checkMessage";
import { ActionRowBuilder, EmbedBuilder } from "discord.js";
import EventEmitter from "node:events";
import { SelfRole } from "./selfrole";

export default class SelfRoleBaseSelector extends EventEmitter {
  name: string;
  title: string;
  description: string;
  roles: SelfRole[];
  messageID: string = "";
  channel: TextChannelGroup;

  constructor(
    name: string,
    title: string,
    roles: SelfRole[],
    channel: TextChannelGroup,
    description: string = ""
  ) {
    super();
    this.name = name;
    this.title = title;
    this.roles = roles;
    this.channel = channel;
    this.description = description;
  }

  public async init() {
    try {
      const message = await checkMessage(
        this.name,
        this.channel,
        this.generateMessage()
      );
      this.addListners();
      return message;
    } catch (error) {
      log_error(error);
      return null;
    }
  }

  protected generateMessage() {
    const embed = new EmbedBuilder()
      .setTitle(this.title)
      .setDescription(this.description)
      .setFooter({ text: "PupNicky" });
    return { embeds: [embed], components: [] as ActionRowBuilder<any>[] };
  }

  protected getRoleByEmoji(emoji: string | null) {
    if (!emoji) return;

    return this.roles.find((role) => {
      let emojiName = emoji;
      if (role.emoji.includes("<")) {
        emojiName = `:${emoji}:`;
      }
      return role.emoji.includes(emojiName);
    });
  }

  protected addListners() {}
}
