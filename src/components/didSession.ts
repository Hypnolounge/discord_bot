import { addCompliment, addSession } from "@db/session";
import config from "@db/config";
import { log_error } from "@utils/error";
import { bindInteractionCreated } from "@utils/events/interactionCreated";
import getChannel from "@utils/getChannel";
import getMember from "@utils/getMember";
import checkMessage from "@utils/message/checkMessage";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  GuildMember,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

const scope = "didSession";

interface Options {
  [key: string]: {
    button: ButtonBuilder;
  };
}

const options: Options = {
  text: {
    button: new ButtonBuilder()
      .setLabel("Text")
      .setEmoji("🗒️")
      .setStyle(ButtonStyle.Primary),
  },
  voice: {
    button: new ButtonBuilder()
      .setLabel("Voice")
      .setEmoji("☎️")
      .setStyle(ButtonStyle.Primary),
  },
  video: {
    button: new ButtonBuilder()
      .setLabel("Video")
      .setEmoji("🎞️")
      .setStyle(ButtonStyle.Primary),
  },
  person: {
    button: new ButtonBuilder()
      .setLabel("Person")
      .setEmoji("👬")
      .setStyle(ButtonStyle.Primary),
  },
};

export default async function DidSession() {
  await createMessage();
}

async function createMessage() {
  try {
    const channel = await getChannel(config.channels.session_counter);

    const message = await checkMessage("didSession", channel, getMessage());

    addListeners();
  } catch (e) {
    log_error(e);
  }
}

function getMessage() {
  const embed = new EmbedBuilder()
    .setTitle("Session Counter")
    .setDescription(
      "Click the button of the type of session you had. This helps us keep track of server activity. You do not need to add a name and compliment. Thanks!"
    )
    .setFooter({ text: "PupNicky" })
    .setColor("Blurple");

  const component = new ActionRowBuilder<ButtonBuilder>();
  Object.keys(options).forEach((key) => {
    const id = `${scope}:${key}`;
    const button = ButtonBuilder.from(options[key].button.toJSON()).setCustomId(
      id
    );
    component.addComponents(button);
  });

  return { embeds: [embed], components: [component] };
}

function addListeners() {
  bindInteractionCreated(
    scope,
    "button",
    async (interaction, action, customId) => {
      await interaction.showModal(getModal(customId));
    }
  );

  bindInteractionCreated(scope, "modal", async (interaction, action) => {
    await interaction.deferReply({ ephemeral: true });
    const user = interaction.fields.getField("user").value;
    const compliment = interaction.fields.getField("compliment").value;
    try {
      if (user) {
        const channel = await getChannel(config.channels.session_counter);
        const complimented = await getMember(user);
        const member = await getMember(interaction.user.id);
        const message = getComplimentMessage(member, complimented, compliment);

        await channel.send(message);
        await addCompliment(member.id, complimented.id, compliment)
      }
      await addSession(interaction.user.id, action);
      await interaction.followUp({
        content: "Your session has been added successfully, and if all the necessary information was provided, the compliment has been added as well!",
        ephemeral: true
      })
    } catch (e) {
      await interaction.followUp({
        content: "Couldn't add compliment\n" + e,
        ephemeral: true,
      });
      return;
    }
  });
}

function getComplimentMessage(
  member: GuildMember,
  complimented: GuildMember,
  compliment: string
) {
  let message = `${member.toString()} did a session with ${complimented.toString()}`;
  if (compliment) {
    message += `\n\n>>> ${compliment}`;
  }
  return message;
}

function getModal(id: string) {
  const modal = new ModalBuilder()
    .setTitle("Give a Compliment")
    .setCustomId(id);

  const userInput = new TextInputBuilder()
    .setLabel("User (ID, Name or display name)")
    .setCustomId("user")
    .setStyle(TextInputStyle.Short)
    .setRequired(false);
  const user = new ActionRowBuilder<TextInputBuilder>().addComponents(
    userInput
  );

  const complimentInput = new TextInputBuilder()
    .setLabel("Compliment")
    .setCustomId("compliment")
    .setStyle(TextInputStyle.Paragraph)
    .setMaxLength(150)
    .setRequired(false);
  const compliment = new ActionRowBuilder<TextInputBuilder>().addComponents(
    complimentInput
  );

  modal.addComponents(user, compliment);

  return modal;
}
