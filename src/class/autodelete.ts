import formatString from "@utils/formatString";
import { Client, Message, TextBasedChannel } from "discord.js";
import EventEmitter = require("events");

export default class AutoDelete extends EventEmitter {
  client: Client;
  channel: TextBasedChannel;
  deleteMessage: string;
  contentOnly: boolean;
  characterMinimum: number;
  excludedRoles: string[];

  constructor(
    client: Client,
    channel: TextBasedChannel,
    deleteMessage: string,
    contentOnly = false,
    characterMinimum = 0,
    excludedRoles = []
  ) {
    super();
    this.client = client;
    this.channel = channel;
    this.deleteMessage = deleteMessage;
    this.contentOnly = contentOnly;
    this.characterMinimum = characterMinimum;
    this.excludedRoles = excludedRoles;
  }

  public init() {
    this.client.on("messageCreate", (message) => {
      if (message.channel.id !== this.channel.id) return;
      if (message.author.bot) return;
      if (message.channel.isThread()) return;
      if (
        this.excludedRoles.some((role) => message.member?.roles.cache.has(role))
      )
        return;

      const passContentCheck = this.contentCheck(message);
      if (!passContentCheck) {
        this.removeMessage(message, "Message contains attachment or link");
        return;
      }

      const passCharacterCheck = this.characterCheck(message);
      if (!passCharacterCheck) {
        this.removeMessage(message, "Character count is too low");
        return;
      }
      this.emit("messagePassed", message);
    });
  }

  protected async removeMessage(message: Message, reason = "") {
    const formatedString = formatString(this.deleteMessage, {
      channelURL: message.channel.url,
      reason: reason,
    });
    await message.delete();
    if(message.system) return;
    await message.author.send(formatedString);
    this.emit("messageDeleted", message);
  }

  protected contentCheck(message: Message) {
    if (!this.contentOnly) return true;

    const hasAttachment = message.attachments.size > 0;
    const hasLink = this.hasLink(message.content);

    if (hasAttachment || hasLink) return true;

    return false;
  }

  protected hasLink(string: string) {
    const linkRegex = /https?:\/\/\S+/;
    return linkRegex.test(string);
  }

  protected characterCheck(message: Message) {
    if (this.characterMinimum === 0) return true;
    return message.content.length >= this.characterMinimum;
  }
}
