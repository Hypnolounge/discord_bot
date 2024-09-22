import config from "@db/config";
import { log_error } from "@utils/error";
import getChannel from "@utils/getChannel";
import getMember from "@utils/getMember";
import checkMessage, { MessageOptions } from "@utils/message/checkMessage";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  Collection,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import prisma from "./db";

interface ModalData {
  id: string;
  label: string;
  required: boolean;
  type: TextInputStyle;
}
const actions: { [key: string]: ModalData[] } = {
  strike_give: [
    {
      id: "user",
      label: "User (ID, Name or display name)",
      required: true,
      type: TextInputStyle.Short,
    },
    {
      id: "reason",
      label: "Reason",
      required: true,
      type: TextInputStyle.Paragraph,
    },
  ],
  strike_view: [
    {
      id: "user",
      label: "User (ID, Name or display name)",
      required: true,
      type: TextInputStyle.Short,
    },
  ],
  strike_delete: [
    {
      id: "strike_id",
      label: "Strike ID",
      required: true,
      type: TextInputStyle.Short,
    },
  ],
};

export default async function Strikes(client: Client) {
  const channel = await getChannel(config.channels.strikes);

  if (!channel || !channel.isTextBased()) {
    log_error("Ticket channel not found");
    return;
  }

  const message = await checkMessage("strikes", channel, generateMessage());

  addListeners(client);
}

function generateMessage() {
  const embed = new EmbedBuilder()
    .setTitle("Strikes")
    .setDescription("You can add, delete and view the strikes.")
    .setColor("Blurple")
    .setFooter({ text: "PupNicky" });

  const giveStrike = new ButtonBuilder()
    .setLabel("Give Strike")
    .setStyle(ButtonStyle.Primary)
    .setCustomId("strike_give");

  const viewStrikes = new ButtonBuilder()
    .setLabel("View Strikes")
    .setStyle(ButtonStyle.Primary)
    .setCustomId("strike_view");

  const deleteStrike = new ButtonBuilder()
    .setLabel("Delete Strike")
    .setStyle(ButtonStyle.Primary)
    .setCustomId("strike_delete");

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    giveStrike,
    viewStrikes,
    deleteStrike
  );

  return { embeds: [embed], components: [row] } as MessageOptions;
}

function addListeners(client: Client) {
  client.on("interactionCreate", async (interaction) => {
    if (interaction.user.bot) return;
    if (!interaction.member) return;
    if (!interaction.isButton() && !interaction.isModalSubmit()) return;
    if (!interaction.customId.startsWith("strike")) return;

    if (interaction.isButton()) {
      await interaction.showModal(getModal(interaction.customId));
    } else if (interaction.isModalSubmit()) {
      await interaction.deferReply({ ephemeral: true });

      if (!interaction.customId) return;
      if (!actions[interaction.customId]) return;
      const data: { [key: string]: string } = {};

      actions[interaction.customId].forEach((input) => {
        const value = interaction.fields.getField(input.id).value;
        data[input.id] = value;
      });

      if (interaction.customId === "strike_give") {
        const user = await checkMember(data.user);

        if (typeof user === "string")
          return await interaction.followUp({ content: user, ephemeral: true });

        try {
          const strike = await prisma.strikes.create({
            data: {
              userID: parseInt(user.id),
              reason: data.reason,
            },
          });

          await interaction.followUp(
            `Strike added to ${user.displayName} with ID ${strike.id}`
          );

          const strikeCount = await prisma.strikes.count({
            where: { userID: parseInt(user.id) },
          });

          if (strikeCount === 3) {
            await user.send(
              "You have 3 strikes. You are banned from the server"
            );
            await user.ban({ reason: "3 strikes" });
          }
          
        } catch (e) {
          return await interaction.followUp("Failed to add strike");
        }
      } else if (interaction.customId === "strike_view") {
        const user = await getMember(data.user);

        if (!user) {
          interaction.editReply("User not found");
          return;
        }
      } else if (interaction.customId === "strike_delete") {
        // Delete strike
      }
    }
  });
}

async function checkMember(member: string) {
  let user = await getMember(member);

  if (!user) return "User not found";

  if (user instanceof Collection) {
    if (user.size === 1) {
      const first = user.first();
      if (first) {
        user = first;
      } else {
        return "User not found";
      }
    } else {
      return "Multiple users found";
    }
  }

  return user;
}

function getModal(customId: string) {
  if (!actions[customId]) {
    log_error("Invalid action " + customId);
    return new ModalBuilder().setTitle("Invalid Action");
  }

  const components: ActionRowBuilder<TextInputBuilder>[] = [];

  actions[customId].forEach((input) => {
    const component = new TextInputBuilder()
      .setCustomId(input.id)
      .setRequired(input.required)
      .setLabel(input.label)
      .setStyle(input.type);

    components.push(
      new ActionRowBuilder<TextInputBuilder>().addComponents(component)
    );
  });

  return new ModalBuilder()
    .setTitle("Give Strike")
    .setCustomId(customId)
    .addComponents(components);
}
