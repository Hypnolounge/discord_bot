import { Prisma } from "@prisma/client";
import {
  ButtonBuilder,
  Interaction as ButtonInteraction,
  ButtonStyle,
  Client,
  ModalBuilder,
  ModalSubmitInteraction,
} from "discord.js";
import { TicketAnswer, TicketCreator } from "./ticket";
import TicketQuestion from "./ticketQuestion";

export default class TicketOpener {
  client: Client;
  name: string;
  title: string;
  description: string;
  questions: TicketQuestion[];
  modal: ModalBuilder;
  ticketCreator: TicketCreator<
    | Prisma.tickets_applicationDelegate
    | Prisma.tickets_issueDelegate
    | Prisma.tickets_miscDelegate
  >;

  constructor(
    client: Client,
    name: string,
    title: string,
    description: string,
    questions: TicketQuestion[],
    ticketCreator: TicketCreator<
      | Prisma.tickets_applicationDelegate
      | Prisma.tickets_issueDelegate
      | Prisma.tickets_miscDelegate
    >
  ) {
    this.client = client;
    this.name = "open_ticket_" + name;
    this.title = title;
    this.description = description;
    this.ticketCreator = ticketCreator;
    this.questions = questions;
    this.modal = this.generateModal();
    this.addListners();
  }

  protected addListners() {
    this.client.on("interactionCreate", async (interaction) => {
      if (!interaction.isButton() && !interaction.isModalSubmit()) return;
      if (interaction.customId !== this.name) return;
      if (interaction.user.bot) return;

      if (interaction.isButton()) {
        if (this.questions.length === 0) {
          await this.openTicket(interaction);
          return;
        }
        await interaction.showModal(this.modal);
      } else {
        await this.openTicket(interaction);
      }
    });
  }

  public getButton() {
    const component = new ButtonBuilder()
      .setCustomId(this.name)
      .setLabel(this.title)
      .setStyle(ButtonStyle.Primary);

    return component;
  }

  protected generateModal() {
    const modal = new ModalBuilder()
      .setTitle(this.title)
      .setCustomId(this.name);

    this.questions.forEach((question) => {
      modal.addComponents(question.generateComponent());
    });

    return modal;
  }

  protected async openTicket(
    interaction: ButtonInteraction | ModalSubmitInteraction
  ) {
    const answers: TicketAnswer[] = [];
    if (interaction.isModalSubmit()) {
      this.questions.forEach((question) => {
        const answer = interaction.fields.getField(question.title);
        if (!answer || !answer.value) return;
        answers.push({ question: question.title, answer: answer.value });
      });
    }
    if (interaction.isButton() || interaction.isModalSubmit()) {
      await this.ticketCreator.createTicket(interaction, answers);
    }
  }
}
