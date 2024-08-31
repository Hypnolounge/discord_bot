import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CategoryChannel,
  Client,
  EmbedBuilder,
  Message,
  TextBasedChannel,
} from "discord.js";
import { log_error } from "../utils/error";

class TicketQuestion {
  question: string;
  placeholder: string;
  required: boolean;

  constructor(
    question: string,
    placeholder: string = "",
    required: boolean = false
  ) {
    this.question = question;
    this.placeholder = placeholder;
    this.required = required;
  }
}

class TicketType {
  type: string;
  description: string;
  questions: TicketQuestion[];
  category: CategoryChannel;

  constructor(
    type: string,
    description: string,
    questions: TicketQuestion[],
    category: CategoryChannel
  ) {
    this.type = type;
    this.description = description;
    this.questions = questions;
    this.category = category;
  }
}

export class TicketOpener {
  client: Client;
  channel: TextBasedChannel;
  messageID: string;
  title: string;
  description: string;
  ticketTypes: TicketType[];

  constructor(
    client: Client,
    channel: TextBasedChannel,
    messageID: string,
    title: string,
    description: string,
    ticketTypes: TicketType[]
  ) {
    this.client = client;
    this.channel = channel;
    this.messageID = messageID;
    this.title = title;
    this.description = description;
    this.ticketTypes = ticketTypes;
  }

  public async init() {
    const message = await this.checkMessage();

    if (!message) {
      this.createNewMessage();
    } else if (message) {
      this.updateMessage(message);
    }
    this.addListners();
  }

  public generateMessage() {
    var description = this.description;

    this.ticketTypes.forEach((type) => {
      description += `**${type.type}**\n${type.description}\n`;
    });

    const embed = new EmbedBuilder()
      .setColor("Blurple")
      .setTitle(this.title)
      .setDescription(description)
      .setFooter({ text: "PupNicky" });

    const row = new ActionRowBuilder();

    this.ticketTypes.forEach((type) => {
      const button = new ButtonBuilder()
        .setCustomId(type.type)
        .setLabel(type.type)
        .setStyle(ButtonStyle.Primary);

      row.addComponents(button);
    });

    return { embeds: [embed], components: [row as any] };
  }

  public async checkMessage() {
    const message = await this.channel.messages.fetch(this.messageID);
    if (!message) {
      log_error("Message not found in TicketOpener");
      return false;
    }
    return message;
  }

  public async updateMessage(message: Message) {
    const newMessage = this.generateMessage();
    if (message.embeds[0].data != newMessage.embeds[0].data) {
      message.edit(newMessage);
      return true;
    }
    return false;
  }

  public async createNewMessage() {
    const newMessage = this.generateMessage();
    const message = await this.channel.send(newMessage);
    this.messageID = message.id;
    return message;
  }

  public addListners() {}
}

class Ticket {}
