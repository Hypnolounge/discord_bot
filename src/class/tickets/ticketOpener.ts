import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
  Message,
  TextBasedChannel,
} from "discord.js";
import { getKeyValue, setKeyValue } from "../../DB/keyValueStore";
import { log_error } from "../../utils/error";
import { BaseTicket } from "./ticket";

interface TicketType {
  name: string;
  description: string;
  ticketClass: BaseTicket;
}

export default class TicketOpener {
  client: Client;
  name: string;
  title: string;
  description: string;
  messageID: string = "";
  channel: TextBasedChannel;
  ticketTypes: TicketType[];

  constructor(
    client: Client,
    name: string,
    title: string,
    channel: TextBasedChannel,
    ticketTypes: TicketType[],
    description: string = ""
  ) {
    this.client = client;
    this.name = name;
    this.title = title;
    this.channel = channel;
    this.ticketTypes = ticketTypes;
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
    let content = this.description;

    this.ticketTypes.forEach((type) => {
      content += `${type.name} : ${type.description}\n`;
    });

    const embed = new EmbedBuilder()
      .setTitle(this.title)
      .setDescription(content)
      .setFooter({ text: "PupNicky" });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      this.ticketTypes.map((type) => {
        return new ButtonBuilder()
          .setCustomId(`open_${type.name}_button`)
          .setLabel(type.name)
          .setStyle(ButtonStyle.Primary);
      })
    );
    return { embeds: [embed], components: [row] };
  }

  public async checkMessage() {
    try {
      const message = await this.channel.messages.fetch(this.messageID);
      return message;
    } catch (e) {
      log_error("Message not found in TicketOpener " + this.name);
      return null;
    }
  }

  public async createNewMessage() {
    const message = await this.channel.send(this.generateMessage());
    this.messageID = message.id;
    await setKeyValue(this.name, this.messageID, "messageID");
    return message;
  }

  public async updateMessage(message: Message) {
    const newMessage = this.generateMessage();
    message.edit(newMessage);
    return true;
  }

  public addListners() {
    this.client.on("interactionCreate", async (interaction) => {
      if (!interaction.isButton()) return;
      if (!interaction.customId.startsWith("open_")) return;
      const ticketType = this.ticketTypes.find((type) =>
        interaction.customId.includes(type.name)
      );
      if (!ticketType) return;

      ticketType.ticketClass.openTicket(interaction.user.id);
    });
  }

  public async openTicket(member: any, ticketType: string) {
    log_error("Open Ticket not implemented");
  }
}
