import { Prisma } from "@prisma/client";
import { bindInteractionCreated } from "@utils/events/interactionCreated";
import {
  ButtonBuilder,
  Interaction as ButtonInteraction,
  ButtonStyle,
  ModalBuilder,
  ModalSubmitInteraction,
} from "discord.js";
import { TicketAnswer, TicketCreator } from "./ticket";
import TicketQuestion from "./ticketQuestion";

export default class TicketOpener {
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
    this.name = name;
    this.title = title;
    this.description = description;
    this.ticketCreator = ticketCreator;
    this.questions = questions;
    this.modal = this.generateModal();
    this.addListners();
  }

  protected addListners() {
    bindInteractionCreated(
      "openTicket",
      "button",
      async (interaction, action) => {
        if (action !== this.name) return;
        if (this.questions.length === 0) {
          await this.openTicket(interaction);
        } else {
          await interaction.showModal(this.modal);
        }
      }
    );

    bindInteractionCreated(
      "openTicket",
      "modal",
      async (interaction, action) => {
        if (action !== this.name) return;
        await this.openTicket(interaction);
      }
    );
  }

  public getButton() {
    const component = new ButtonBuilder()
      .setCustomId("openTicket:" + this.name)
      .setLabel(this.title)
      .setStyle(ButtonStyle.Primary);

    return component;
  }

  protected generateModal() {
    const modal = new ModalBuilder()
      .setTitle("openTicket:" + this.title)
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
