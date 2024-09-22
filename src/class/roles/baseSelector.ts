import checkMessage from "@utils/message/checkMessage";
import {
  ActionRowBuilder,
  Client,
  EmbedBuilder,
  TextBasedChannel,
} from "discord.js";
import { SelfRole } from "./selfrole";
import EventEmitter = require("events");

export default class SelfRoleBaseSelector extends EventEmitter {
  client: Client;
  name: string;
  title: string;
  description: string;
  roles: SelfRole[];
  messageID: string = "";
  channel: TextBasedChannel;

  constructor(
    client: Client,
    name: string,
    title: string,
    roles: SelfRole[],
    channel: TextBasedChannel,
    description: string = ""
  ) {
    super();
    this.client = client;
    this.name = name;
    this.title = title;
    this.roles = roles;
    this.channel = channel;
    this.description = description;
  }

  public async init() {
    const message = await checkMessage(
      this.name,
      this.channel,
      this.generateMessage()
    );
    this.addListners();
    return message;
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
