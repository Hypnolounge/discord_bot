import config from "@db/config";
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
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

const scope = "infoCenter";

export default async function InfoCenter() {
  await createMessage();
}

async function createMessage() {
  try {
    const channel = await getChannel(config.channels.info_centre);

    const message = await checkMessage("didSession", channel, getMessage());

    addListeners();
  } catch (e) {
    log_error(e);
  }
}
function addListeners() {
  bindInteractionCreated(
    scope,
    "button",
    async (interaction, action, customId) => {
      const [target, p] = action.split(";", 2);
      const page = parseInt(p);
      if (page === 0 && target == "someone") {
        return interaction.showModal(getModal(customId));
      }
      await interaction.deferReply({
        ephemeral: true
      })
      const user = target && target === "yourself" ? interaction.user.id : target
      const info = await getInfoPage(user, page+1)
      interaction.followUp(info)
    }
  );

  bindInteractionCreated(
    scope,
    "modal",
    async (interaction, action, customId) => {
      interaction.deferReply({ ephemeral: true });
      const user = interaction.fields.getField("user").value;
      try {
        const member = await getMember(user);
        await interaction.followUp(getInfoPage(member.id, 1));
      } catch (e) {
        await interaction.followUp({
          content: "Couldn't open Info Center\n" + e,
          ephemeral: true,
        });
        return;
      }
    }
  );
}

function getMessage(): MessageOptions {
  const embed = new EmbedBuilder()
    .setTitle("Info Centre")
    .setDescription("")
    .setColor("Blurple")
    .setFooter({ text: "PupNicky" });

  const someone = new ButtonBuilder()
    .setLabel("Someone")
    .setCustomId(`${scope}:someone;0`)
    .setStyle(ButtonStyle.Primary);

  const self = new ButtonBuilder()
    .setLabel("Yourself")
    .setCustomId(`${scope}:yourself;0`)
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    someone,
    self
  );

  return {
    embeds: [embed],
    components: [row],
  };
}

function getInfoPage(user: string, page: number): MessageOptions {
  return {};
}

function getModal(customId: string) {
  const userInput = new TextInputBuilder()
    .setLabel("User (ID, Name or display name)")
    .setCustomId("user")
    .setStyle(TextInputStyle.Short);
  const user = new ActionRowBuilder<TextInputBuilder>().addComponents(
    userInput
  );

  const modal = new ModalBuilder()
    .setCustomId(customId)
    .setTitle("Search User")
    .addComponents(user);

  return modal;
}
