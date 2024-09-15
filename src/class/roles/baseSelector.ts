import {
  ActionRowBuilder,
  Client,
  EmbedBuilder,
  Message,
  TextBasedChannel,
} from "discord.js";
import { log_error } from "../../utils/error";
import { getKeyValue, setKeyValue } from "../../DB/keyValueStore";
import { SelfRole } from "./selfrole";

export default class SelfRoleBaseSelector {
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
    this.client = client;
    this.name = name;
    this.title = title;
    this.roles = roles;
    this.channel = channel;
    this.description = description;
  }

  public async init() {
    this.messageID = await getKeyValue(this.name, "messageID");
    const message = await this.checkMessage();

    if (!message) {
      this.createNewMessage();
    } else {
      this.updateMessage(message);
    }
    this.addListners();
  }

  public generateMessage() {
    const embed = new EmbedBuilder()
      .setTitle(this.title)
      .setDescription(this.description)
      .setFooter({ text: "PupNicky" });
    return { embeds: [embed], components: [] as ActionRowBuilder<any>[] };
  }

  public async checkMessage() {
    try {
      const message = await this.channel.messages.fetch(this.messageID);
      return message;
    } catch (error) {
      log_error("Message not found in SelfRoleSelector " + this.name);
      return false;
    }
  }

  public async updateMessage(message: Message) {
    const newMessage = this.generateMessage();
    message.edit(newMessage);
    return true;
  }

  public async createNewMessage() {
    const newMessage = this.generateMessage();
    try {
      const message = await this.channel.send(newMessage);
      this.messageID = message.id;
      setKeyValue(this.name, this.messageID, "messageID");
      return message;
    } catch (error) {
      log_error("Message not sent in SelfRoleSelector " + this.name);
      return false;
    }
  }

  public getRoleByEmoji(emoji: string | null) {
    if (!emoji) return;

    return this.roles.find((role) => {
      let emojiName = emoji;
      if (role.emoji.includes("<")) {
        emojiName = `:${emoji}:`;
      }
      return role.emoji.includes(emojiName);
    });
  }

  public addListners() {}
}
