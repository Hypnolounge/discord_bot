import { Client, Message, TextChannel } from "discord.js";
import formatString from "../utils/formatString";

export default class AutoDelete {
  client: Client;
  channel: TextChannel;
  deleteMessage: string;
  contentOnly: boolean;
  characterMinimum: number;

  constructor(
    client: Client,
    channel: TextChannel,
    deleteMessage: string,
    contentOnly = false,
    characterMinimum = 0
  ) {
    this.client = client;
    this.channel = channel;
    this.deleteMessage = deleteMessage;
    this.contentOnly = contentOnly;
    this.characterMinimum = characterMinimum;
  }

  public register() {
    this.client.on("messageCreate", (message) => {
      if (message.channel.id !== this.channel.id) return;

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
    });
  }

  private async removeMessage(message: Message, reason = "") {
    const formatedString = formatString(this.deleteMessage, {
      channelURL: message.channel.url,
      reason: reason,
    });
    await message.delete();
    await message.author.send(formatedString);
  }

  private contentCheck(message: Message) {
    if (!this.contentOnly) return true;

    const hasAttachment = message.attachments.size > 0;
    const hasLink = this.hasLink(message.content);

    if (hasAttachment || hasLink) return true;

    return false;
  }

  private hasLink(string: string) {
    const linkRegex = /https?:\/\/\S+/;
    return linkRegex.test(string);
  }

  private characterCheck(message: Message) {
    if (this.characterMinimum === 0) return true;
    return message.content.length >= this.characterMinimum;
  }
}
