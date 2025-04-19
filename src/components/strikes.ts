import { TicketAnswer, TicketCreator } from "@class/tickets/ticket";
import config from "@db/config";
import db from "@db/index";
import strikes from "@db/schema/strikes";
import { ticketsIssue } from "@db/schema/tickets";
import { getMemberStrikes } from "@db/user";
import { log_error } from "@utils/error";
import { bindInteractionCreated } from "@utils/events/interactionCreated";
import getChannel from "@utils/getChannel";
import getMember from "@utils/getMember";
import checkMessage, { MessageOptions } from "@utils/message/checkMessage";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { and, count, eq } from "drizzle-orm";

interface ModalData {
  id: string;
  label: string;
  required: boolean;
  type: TextInputStyle;
}
const actions: { [key: string]: ModalData[] } = {
  give: [
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
  view: [
    {
      id: "user",
      label: "User (ID, Name or display name)",
      required: true,
      type: TextInputStyle.Short,
    },
  ],
  delete: [
    {
      id: "user",
      label: "User (ID, Name or display name)",
      required: true,
      type: TextInputStyle.Short,
    },
    {
      id: "strike_id",
      label: "Strike ID",
      required: true,
      type: TextInputStyle.Short,
    },
  ],
};

const StrikeTicket = new TicketCreator(
  "strike",
  config.categories.issues,
  ticketsIssue,
  undefined,
  {
    applied: {
      button: new ButtonBuilder()
        .setLabel("Apply")
        .setStyle(ButtonStyle.Danger),
      message: "The strike has been applied.",
      closeAction: async (member, message) => {
        try {
          await db.insert(strikes).values({
            userID: member.id,
            reason: message
          })

          const strikeCount = (await db.select({value: count()}).from(strikes).where(eq(strikes.userID, member.id)))[0].value

          if (strikeCount === 3) {
            await member.send(
              "You have 3 strikes. You are banned from the server"
            );
            await member.ban({ reason: "3 strikes" });
          }
        } catch (e) {
          log_error(e);
        }
      },
    },
    dropped: {
      button: new ButtonBuilder()
        .setLabel("Drop")
        .setStyle(ButtonStyle.Secondary),
      message: "The strike has been dropped.",
    },
  }
);

const scope = "strike";

export default async function Strikes() {
  try {
    const channel = await getChannel(config.channels.strikes);

    await checkMessage("strikes", channel, generateMessage());

    addListeners();
  } catch (error) {
    log_error(error);
  }
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
    .setCustomId("strike:give");

  const viewStrikes = new ButtonBuilder()
    .setLabel("View Strikes")
    .setStyle(ButtonStyle.Primary)
    .setCustomId("strike:view");

  const deleteStrike = new ButtonBuilder()
    .setLabel("Delete Strike")
    .setStyle(ButtonStyle.Primary)
    .setCustomId("strike:delete");

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    giveStrike,
    viewStrikes,
    deleteStrike
  );

  return { embeds: [embed], components: [row] } as MessageOptions;
}

function addListeners() {
  bindInteractionCreated(scope, "button", async (interaction, action) => {
    await interaction.showModal(getModal(action));
  });

  bindInteractionCreated(scope, "modal", async (interaction, action) => {

    const data: { [key: string]: string } = {};

    actions[action].forEach((input) => {
      const value = interaction.fields.getField(input.id).value;
      data[input.id] = value;
    });

    switch (action) {
      case "give":
        await giveStrike(data, interaction);
        break;
      case "view":
        await viewStrike(data, interaction);
        break;
      case "delete":
        await deleteStrike(data, interaction);
        break;
      default:
        break;
    }
  });
}

async function giveStrike(
  data: { [key: string]: string },
  interaction: ModalSubmitInteraction
) {
  try {
    const member = await getMember(data.user);
    const reason:TicketAnswer = {
      question: "Reason",
      answer: data.reason
    };
    await StrikeTicket.createTicket(interaction, [reason], member);
  } catch (e) {
    log_error(e);
    return await interaction.reply("Failed to open strike ticket \n" + e);
  }
}

async function viewStrike(
  data: { [key: string]: string },
  interaction: ModalSubmitInteraction
) {
  try {
    await interaction.deferReply();
    const user = await getMember(data.user);

    const strikesdata = await getMemberStrikes(user.id)

    if (strikesdata.length === 0) {
      return await interaction.followUp({
        content: "No strikes found",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`${user.displayName}'s Strikes`)
      .setColor("Blurple")
      .setFooter({ text: "PupNicky" });

    strikesdata.forEach((strike) => {
      embed.addFields({
        name: `ID: ${strike.id}`,
        value: `Reason: ${strike.reason}`,
      });
    });

    await interaction.followUp({ embeds: [embed], ephemeral: true });
  } catch (error) {
    log_error(error);
    return await interaction.followUp({
      content: "Failed to view strikes \n" + error,
      ephemeral: true,
    });
  }
}

async function deleteStrike(
  data: { [key: string]: string },
  interaction: ModalSubmitInteraction
) {
  try {
    await interaction.deferReply();

    const user = await getMember(data.user);
    const strike = (await db.delete(strikes).where(and(eq(strikes.id, parseInt(data.strike_id)), eq(strikes.userID, user.id))).returning())[0]

    await interaction.followUp(
      `Strike with ID ${strike.id} deleted for ${user.displayName}`
    );
  } catch (error) {
    log_error(error);
    return await interaction.followUp({
      content: "Failed to delete strike \n" + error,
      ephemeral: true,
    });
  }
}

function getModal(action: string) {
  if (!actions[action]) {
    log_error("Invalid action " + action);
    return new ModalBuilder().setTitle("Invalid Action");
  }

  const components: ActionRowBuilder<TextInputBuilder>[] = [];

  actions[action].forEach((input) => {
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
    .setTitle("Strike")
    .setCustomId(`${scope}:${action}`)
    .addComponents(components);
}
