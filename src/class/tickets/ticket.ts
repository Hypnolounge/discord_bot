import config from "@db/config";
import { getPrevApplications } from "@db/user";
import {
  Prisma,
  tickets_application,
  tickets_issue,
  tickets_misc,
} from "@prisma/client";
import { TextChannelGroup } from "@typings/TextChannelGroup";
import { bindInteractionCreated } from "@utils/events/interactionCreated";
import getMember from "@utils/getMember";
import getRole from "@utils/getRole";
import Logger, { LogEntry, TicketLogger } from "@utils/Logger";
import sleep from "@utils/sleep";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  Guild,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
  User,
} from "discord.js";

export interface TicketAnswer {
  question: string;
  answer: string;
}

export class TicketCreator<
  T extends
    | Prisma.tickets_applicationDelegate
    | Prisma.tickets_issueDelegate
    | Prisma.tickets_miscDelegate
> {
  type: string;
  categoryID: string;
  table: T;
  autoMessage: string[];
  extraButtons: { [key: string]: ButtonBuilder };
  reasonToMessage: { [key: string]: string } = {
    approved:
      "Welcome! Head to https://discord.com/channels/1125008815272759408/1125014789450641458 and introduce yourself there. Then, you will be able to choose a role. Choose a primary role, then come and say hi in General!",
    incomplete:
      "You have failed to read the rules properly and have missed a step in the application procedure that is clearly stated in the rules. Feel free to try again, but we are denying you for now. (https://discord.gg/Caz6NHR2Zu)",
    denied:
      "You haven't convinced us that you would be a good fit in the Hypnolounge. We want our members to be able to contribute to a friendly community by being themselves and not just random horny strangers on the internet. The Hypnolounge is a place of discussion and rapport, not a place for random hookups like Grindr. There is another server, Hypnosis for Guys, where they would rather just get on with the hypnosis and do nothing else. We think you would be a much better fit there: https://hypnosisforguys.com/",
    expired:
      "You have taken longer than three days to finish your application. Feel free to try again, but we are denying you for now. (https://discord.gg/Caz6NHR2Zu)",
    closed: "The ticket has been closed.",
  };

  constructor(
    type: string,
    categoryID: string,
    table: T,
    autoMessage: string[] = [],
    extraButtons: { [key: string]: ButtonBuilder } = {}
  ) {
    this.type = type;
    this.categoryID = categoryID;
    this.table = table;
    this.autoMessage = autoMessage;
    this.extraButtons = extraButtons;

    this.addListeners();
  }

  protected async addListeners() {
    bindInteractionCreated(
      "closeTicket",
      "modal",
      async (interaction, action) => {
        await interaction.deferReply({ ephemeral: true });

        try {
          const split = action.split("-");
          const type = split[0];
          if (type !== this.type) return;
          const ticketID = parseInt(split[1]);
          const reason = split[2];
          const member = await getMember(interaction.user.id);

          if (
            reason !== "closed" &&
            !member.roles.cache.has(config.roles.mod)
          ) {
            return await interaction.reply({
              content: "Only a mod can use that.",
              ephemeral: true,
            });
          }

          await this.closeTicket(
            ticketID,
            reason,
            interaction.fields.getField("message").value,
            interaction
          );
        } catch (error) {
          await interaction.followUp("Error closing ticket");
          Logger.log({
            title: "Error closing ticket",
            message: "Error closing ticket",
            type: "error",
            error: error,
          } as LogEntry);
        }
      }
    );

    bindInteractionCreated(
      "closeTicket",
      "button",
      async (interaction, action) => {
        try {
          const split = action.split("_");
          const type = split[0];
          if (type !== this.type) return;
          const reason = split[2];
          const member = await getMember(interaction.user.id);

          if (
            reason !== "closed" &&
            !member.roles.cache.has(config.roles.mod)
          ) {
            return await interaction.reply({
              content: "Only a mod can use that.",
              ephemeral: true,
            });
          }

          await interaction.showModal(await this.getCloseModal(action));
        } catch (error) {
          await interaction.reply("Error closing ticket");
          Logger.log({
            title: "Error closing ticket",
            message: "Error closing ticket",
            type: "error",
            error,
          } as LogEntry);
        }
      }
    );
  }

  protected async getCloseModal(id: string) {
    const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setCustomId("message")
        .setLabel("Message")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)
    );

    const modal = new ModalBuilder()
      .setTitle("Close Ticket")
      .setCustomId(id)
      .addComponents(actionRow);

    return modal;
  }

  protected async closeTicket(
    ticketID: number,
    reason: string,
    message: string,
    interaction: ModalSubmitInteraction
  ) {
    try {
      await interaction.followUp("Closing ticket...");

      await this.closeDBTicket(ticketID, reason);

      const member = await getMember(interaction.user.id);

      const memberPing = member
        ? `${member.toString()} (${member.displayName})`
        : "Unknown";

      const ticketType = this.type.charAt(0).toUpperCase() + this.type.slice(1);
      const embed = new EmbedBuilder()
        .setTitle(`${ticketType} Ticket Closed`)
        .addFields([
          { name: "ID", value: `${ticketID}`, inline: true },
          { name: "Opened By", value: memberPing, inline: true },
          {
            name: "Closed By",
            value: interaction.user.toString(),
            inline: true,
          },
          {
            name: "Reason",
            value:
              this.reasonToMessage[reason] || this.reasonToMessage["closed"],
          },
        ]);

      if (message) embed.addFields({ name: "Message", value: message });

      await TicketLogger.log(embed);

      if (member) await member.send({ embeds: [embed] });

      await interaction.channel?.delete();

      switch (reason) {
        case "approved":
          await member?.roles.add(config.roles.accepted);
          break;
        case "denied":
          await member?.ban({ reason: "Denied application" });
        default:
          break;
      }
    } catch (error) {
      return { success: false, error };
    }
    return { success: true };
  }

  protected async closeDBTicket(ticketID: number, reason: string) {
    const result: tickets_application | tickets_issue | tickets_misc = await (
      this.table as any
    ).update({
      where: {
        id: ticketID,
      },
      data: {
        closed: new Date().getTime(),
        reason: reason,
      },
    });

    return result;
  }

  public async createTicket(
    interaction: ModalSubmitInteraction | ButtonInteraction,
    answers: TicketAnswer[]
  ) {
    await interaction.deferReply({ ephemeral: true });

    if (!interaction.guild)
      return await this.handleCreationError(interaction, "Guild not found");

    const { ticket, error: error1 } = await this.insertDBTicket(
      interaction.user.id
    );
    if (!ticket)
      return await this.handleCreationError(
        interaction,
        "Error inserting ticket into DB",
        error1
      );

    const { channel, error: error2 } = await this.createChannel(
      interaction.guild,
      ticket.id,
      interaction.user
    );
    if (!channel)
      return await this.handleCreationError(
        interaction,
        "Error creating channel",
        error2
      );

    const { result, error: error3 } = await this.updateDBTicket(
      ticket.id,
      channel.id
    );
    if (!result)
      return await this.handleCreationError(
        interaction,
        "Error updating ticket in DB",
        error3
      );

    const { success, error: error4 } = await this.sendMessages(
      channel,
      answers,
      ticket.id,
      interaction.user
    );

    if (!success)
      return await this.handleCreationError(
        interaction,
        "Error sending messages to channel",
        error4
      );

    await interaction.followUp({
      content: "Ticket created here: " + channel.toString(),
      ephemeral: true,
    });
  }

  protected async insertDBTicket(userID: string) {
    try {
      const ticket = await this.table.create({
        data: {
          userID: parseInt(userID),
          opened: new Date().getTime(),
          channel: 0,
          reason: "",
          closed: 0,
        },
      });

      return { ticket };
    } catch (error) {
      return { ticket: null, error };
    }
  }

  public async createChannel(guild: Guild, ticketID: number, user: User) {
    try {
      const channel = await guild.channels.create({
        name: `${this.type}-${ticketID}-${user.displayName}`,
        type: ChannelType.GuildText,
        parent: this.categoryID,
        reason: `Create ${this.type} ticket for ${user.username}`,
        permissionOverwrites: [
          {
            id: user.id,
            allow: ["ViewChannel", "SendMessages"],
          },
          {
            id: guild.roles.everyone,
            deny: ["ViewChannel"],
          },
          {
            id: config.roles.mod,
            allow: ["ViewChannel"],
          },
        ],
      });

      return { channel };
    } catch (error) {
      return { channel: null, error };
    }
  }

  protected async updateDBTicket(ticketID: number, channelID: string) {
    try {
      const result: tickets_application | tickets_issue | tickets_misc = await (
        this.table as any
      ).update({
        where: {
          id: ticketID,
        },
        data: {
          channel: parseInt(channelID),
        },
      });
      return { result };
    } catch (error) {
      return { result: null, error };
    }
  }

  protected async sendMessages(
    channel: TextChannelGroup,
    answers: TicketAnswer[],
    ticketID: number,
    member: User
  ) {
    const embed = await this.getAnswers(answers, member.id);
    const buttons = this.getButtons(ticketID);

    try {
      await channel.send({ embeds: [embed], components: [buttons] });
    } catch (error) {
      return { success: false, error };
    }

    for (const message of this.autoMessage) {
      try {
        await channel.send(message);
      } catch (error) {
        return { success: false, error };
      }
    }

    const modRole = await getRole(config.roles.mod);

    if (!modRole) return { success: false, error: "Mod role not found" };

    try {
      const message = await channel.send(
        modRole.toString() + member.toString()
      );
      await sleep(2000);
      await message.delete();
    } catch (error) {
      return { success: false, error };
    }

    return { success: true };
  }

  protected async getAnswers(answers: TicketAnswer[], memberID: string) {
    const embed = new EmbedBuilder()
      .setTitle(this.type)
      .setColor("Blurple")
      .setFooter({ text: "PupNicky" });

    answers.forEach((answer) => {
      embed.addFields([{ name: answer.question, value: answer.answer }]);
    });

    if (this.type === "application") {
      const prev = await getPrevApplications(memberID);

      embed.addFields({
        name: "Previous Applications",
        value: prev || "No previous applications",
      });
    }

    return embed;
  }

  protected getButtons(ticketID: number) {
    const row = new ActionRowBuilder<ButtonBuilder>();

    if (this.extraButtons) {
      Object.keys(this.extraButtons).forEach((key) => {
        const id = `closeTicket:${this.type}_${ticketID}_${key}`;
        const button = this.extraButtons[key].setCustomId(id);
        row.addComponents(button);
      });
    }

    const close = new ButtonBuilder()
      .setCustomId(`closeTicket:${this.type}_${ticketID}_closed`)
      .setLabel("Close")
      .setStyle(ButtonStyle.Secondary);

    row.addComponents(close);

    return row;
  }

  protected async handleCreationError(
    interaction: ModalSubmitInteraction | ButtonInteraction,
    reason: string,
    error?: any
  ) {
    await interaction.followUp({
      content: "Error creating ticket",
      ephemeral: true,
    });

    Logger.log(
      new LogEntry("Error creating ticket", `${reason}`, "error", error)
    );
    return null;
  }
}
