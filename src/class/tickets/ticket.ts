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
  GuildMember,
  ModalBuilder,
  ModalSubmitInteraction,
  PermissionResolvable,
  TextInputBuilder,
  TextInputStyle,
  User,
} from "discord.js";

export interface TicketAnswer {
  question: string;
  answer: string;
}

export interface CloseOptions {
  [key: string]: {
    button: ButtonBuilder;
    message: string;
    closeAction?: (member: GuildMember, message: string) => Promise<any>;
  };
}

const defaultButtons = {
  closed: {
    button: new ButtonBuilder()
      .setCustomId("closeTicket")
      .setLabel("Close")
      .setStyle(ButtonStyle.Danger),
    message: "The ticket has been closed.",
  },
};

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
  closeOptions: CloseOptions;

  constructor(
    type: string,
    categoryID: string,
    table: T,
    autoMessage: string[] = [],
    closeOptions: CloseOptions = defaultButtons
  ) {
    this.type = type;
    this.categoryID = categoryID;
    this.table = table;
    this.autoMessage = autoMessage;
    this.closeOptions = closeOptions;

    this.addListeners();
  }

  protected async addListeners() {
    bindInteractionCreated(
      "closeTicket",
      "modal",
      async (interaction, action) => {
        await interaction.deferReply({ ephemeral: true });
        try {
          const split = action.split("_");
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
      async (interaction, action, customId) => {
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

          await interaction.showModal(await this.getCloseModal(customId || ""));
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

      const ticket = await this.closeDBTicket(ticketID, reason);

      const member = await getMember(ticket.userID.toString());

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
            value: this.closeOptions[reason].message,
          },
        ]);

      if (message) embed.addFields({ name: "Message", value: message });

      await TicketLogger.log(embed);

      if (member) await member.send({ embeds: [embed] });

      await interaction.channel?.delete();

      await this.closeOptions[reason].closeAction?.(member, message);
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
    answers: TicketAnswer[],
    overwriteMember?: GuildMember,
    addUsers: string[] = []
  ) {
    await interaction.deferReply({ ephemeral: true });

    if (!interaction.guild)
      return await this.handleCreationError(interaction, "Guild not found");

    if (!interaction.member || !(interaction.member instanceof GuildMember))
      return await this.handleCreationError(interaction, "Member not found");

    let member = interaction.member;
    if (overwriteMember) member = overwriteMember;

    const { ticket, error: error1 } = await this.insertDBTicket(member.id);
    if (!ticket)
      return await this.handleCreationError(
        interaction,
        "Error inserting ticket into DB",
        error1
      );

    const { channel, error: error2 } = await this.createChannel(
      interaction.guild,
      ticket.id,
      member,
      addUsers
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
      member.user
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

  public async createChannel(
    guild: Guild,
    ticketID: number,
    member: GuildMember,
    addUsers: string[] = []
  ) {
    try {
      const permissionOverwrites = [
        {
          id: guild.roles.everyone.id,
          deny: ["ViewChannel"] as PermissionResolvable,
        },
        {
          id: config.roles.mod,
          allow: ["ViewChannel"] as PermissionResolvable,
        },
        {
          id: member.id,
          allow: ["ViewChannel", "SendMessages"] as PermissionResolvable,
        },
      ];

      addUsers.forEach((id) => {
        permissionOverwrites.push({
          id: id,
          allow: ["ViewChannel", "SendMessages"],
        });
      });

      const channel = await guild.channels.create({
        name: `${this.type}-${ticketID}-${member.displayName}`,
        type: ChannelType.GuildText,
        parent: this.categoryID,
        reason: `Create ${this.type} ticket for ${member.displayName}`,
        permissionOverwrites: permissionOverwrites,
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
    user: User
  ) {
    const embed = await this.getAnswers(answers, user.id);
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
      const message = await channel.send(modRole.toString() + user.toString());
      await sleep(2000);
      await message.delete();
    } catch (error) {
      return { success: false, error };
    }

    return { success: true };
  }

  protected async getAnswers(answers: TicketAnswer[], memberID: string) {
    const title = this.type.charAt(0).toUpperCase() + this.type.slice(1) + " Ticket";
    const embed = new EmbedBuilder()
      .setTitle(title)
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

    Object.keys(this.closeOptions).forEach((key) => {
      const id = `closeTicket:${this.type}_${ticketID}_${key}`;
      const button = this.closeOptions[key].button.setCustomId(id);
      row.addComponents(button);
    });

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
