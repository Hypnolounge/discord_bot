import config from "@db/config";
import {
  getMemberCompliments,
  getMemberInfo,
  getMemberSessions,
} from "@db/user";
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
  GuildMember,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

const scope = "infoCenter";
const complimentsPerPage = 5;

const personalize : {[key:string]:{[key:string]:string}} = {
  yourself: {
    start: "Here are your stats",
    error: "An error occurred while fetching your info. 😢",
    noCompliments: "You don't have any compliments yet. 😢",
    complimentsTitle: "Your compliments",
    noStrikes: "You don't have any strikes yet. Good job 🤗",
    sessionStats: "Here are your session stats",
  },
  someone: {
    start: "Here are the stats for",
    error: "An error occurred while fetching the user's info. 😢",
    noCompliments: "They don't have any compliments yet. 😢",
    complimentsTitle: "Compliments of",
    noStrikes: "They don't have any strikes yet. Good job 🤗",
    sessionStats: "Here are the session stats for",
  }
}

export default async function InfoCenter() {
  await createMessage();
}

async function createMessage() {
  try {
    const channel = await getChannel(config.channels.info_centre);

    const message = await checkMessage("infoCenter", channel, getMessage());

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
      const [target, type, p, personal] = action.split(";", 4);
      const page = parseInt(p);
      if (type === "new" && personal == "someone") {
        return interaction.showModal(getModal(customId));
      }
      if (type === "new") {
        await interaction.deferReply({
          ephemeral: true,
        });
      } else {
        await interaction.deferUpdate();
      }
      const user =
        target && personal === "yourself" ? interaction.user.id : target;
      const info = await getInfoPage(user, type, page, personal);
      interaction.editReply(info);
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
        await interaction.followUp(await getInfoPage(member.id, "new", 1, "someone"));
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
    .setDescription(
      "Click the button and enter a name to get some basic information on a user."
    )
    .setColor("Blurple")
    .setFooter({ text: "PupNicky" });

  const someone = new ButtonBuilder()
    .setLabel("Someone")
    .setCustomId(`${scope}:0;new;1;someone`)
    .setStyle(ButtonStyle.Primary);

  const self = new ButtonBuilder()
    .setLabel("Yourself")
    .setCustomId(`${scope}:0;new;1;yourself`)
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

async function getInfoPage(
  user: string,
  type: string,
  page: number,
  personal: string
): Promise<MessageOptions> {
  const member = await getMember(user);
  switch (type) {
    case "start":
      return await getStartPage(member, personal);
    case "compliments":
      return await getComplimentsPage(member, page, personal);
    case "strikes":
      return await getStrikesPage(member, personal);
    case "sessions":
      return await getSessionsPage(member, personal);
    default:
      return await getStartPage(member, personal);
  }
}

async function getStartPage(user: GuildMember, personal: string): Promise<MessageOptions> {
  const embed = new EmbedBuilder()
    .setTitle("Basic Info")
    .setColor("Blurple")
    .setFooter({ text: "PupNicky" })
    .setDescription(`${personalize[personal].start} ${user.toString()}`);

  try {
    const infos = await getMemberInfo(user.id);
    embed.addFields([
      {
        name: "Primary Role",
        value: infos.member?.primary || "Unknown",
        inline: false,
      },
      {
        name: "Region",
        value: infos.member?.continent || "Unknown",
        inline: false,
      },
      {
        name: "Intro",
        value: infos.url || "Unknown",
        inline: false,
      },
      {
        name: "Member?",
        value: infos.isMember,
        inline: false,
      },
    ]);
  } catch (e) {
    log_error(e);
    embed.addFields({
      name: "Error",
      value: personalize[personal].error,
      inline: false,
    });
  }

  const compliments = new ButtonBuilder()
    .setLabel("Compliments")
    .setCustomId(`${scope}:${user.id};compliments;1;${personal}`)
    .setStyle(ButtonStyle.Primary);

  const strikes = new ButtonBuilder()
    .setLabel("Strikes")
    .setCustomId(`${scope}:${user.id};strikes;1;${personal}`)
    .setStyle(ButtonStyle.Primary);

  const sessions = new ButtonBuilder()
    .setLabel("Sessions")
    .setCustomId(`${scope}:${user.id};sessions;1;${personal}`)
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    compliments,
    strikes,
    sessions
  );

  return {
    embeds: [embed],
    components: [row],
  };
}

async function getComplimentsPage(
  user: GuildMember,
  page: number,
  personal: string
): Promise<MessageOptions> {
  const embed = new EmbedBuilder()
    .setTitle(`${personalize[personal].complimentsTitle} ${user.displayName}`)
    .setColor("Blurple")
    .setFooter({ text: "PupNicky" });

  let lastPage = false;

  try {
    const compliments = await getMemberCompliments(user.id);
    const compliment = compliments[page - 1];
    lastPage = page === compliments.length;
    const isReceived = compliment.receive === user.id;
    const otherUserId = isReceived ? compliment.give : compliment.receive;
    const otherMember = await getMember(otherUserId);
    const header = isReceived ? "Received from" : "Given to";
    const comment = compliment.comment || "_No comment from user_";

    if (compliments.length === 0) {
      embed.setDescription(personalize[personal].noCompliments);
    } else {
      embed.setDescription(
        `${header} ${otherMember.toString()}\n\n>>> ${comment}`
      );
    }

    /* // Calculate pagination details
    const totalPages = Math.ceil(compliments.length / complimentsPerPage);
    lastPage = page === totalPages;
    const startIndex = (page-1) * complimentsPerPage;
    const endIndex = startIndex + complimentsPerPage;

    // Get the current slice of compliments
    const currentPageCompliments = compliments.slice(startIndex, endIndex);

    // Process and add compliments to the embed
    for (const compliment of currentPageCompliments) {
      const isReceived = compliment.receive === user.id;
      const otherUserId = isReceived ? compliment.give : compliment.receive;
      const header = isReceived ? "Received from" : "Given to";
      const comment = compliment.comment || "_No comment from user_";
      try {
        const otherMember = await getMember(otherUserId);

        embed.addFields({
          name: comment,
          value: `${header} ${otherMember.toString()}`,
          inline: false,
        });
      } catch (error) {
        embed.addFields({
          name: `${header} Unknown`,
          value: comment,
          inline: false,
        });
      }
    } */
  } catch (e) {
    log_error(e);
    embed.addFields({
      name: "Error",
      value: personalize[personal].error,
      inline: false,
    });
  }

  const prev = new ButtonBuilder()
    .setLabel("◀️")
    .setCustomId(`${scope}:${user.id};compliments;${page - 1};${personal}`)
    .setStyle(ButtonStyle.Primary)
    .setDisabled(page === 1);

  const next = new ButtonBuilder()
    .setLabel("▶️")
    .setCustomId(`${scope}:${user.id};compliments;${page + 1};${personal}`)
    .setStyle(ButtonStyle.Primary)
    .setDisabled(lastPage);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    getBackButton(user.id, personal),
    prev,
    next
  );

  return {
    embeds: [embed],
    components: [row],
  };
}

async function getStrikesPage(user: GuildMember, personal: string): Promise<MessageOptions> {
  const embed = new EmbedBuilder()
    .setTitle("Strikes")
    .setColor("Blurple")
    .setFooter({ text: "PupNicky" });

  let strikes: { [key: string]: string } = {};

  try {
  } catch (e) {
    log_error(e);
    embed.addFields({
      name: "Error",
      value: personalize[personal].error,
      inline: false,
    });
  }

  if (Object.keys(strikes).length === 0) {
    embed.setDescription(personalize[personal].noStrikes);
  }
  Object.keys(strikes).forEach((key) => {
    embed.addFields({
      name: key,
      value: strikes[key],
      inline: false,
    });
  });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    getBackButton(user.id, personal)
  );

  return {
    embeds: [embed],
    components: [row],
  };
}

async function getSessionsPage(user: GuildMember, personal: string): Promise<MessageOptions> {
  const embed = new EmbedBuilder()
    .setTitle(`${personalize[personal].sessionStats} ${user.displayName}`)
    .setColor("Blurple")
    .setFooter({ text: "PupNicky" });

  const sessions: { [key: string]: number } = {
    total: 0,
    person: 0,
    video: 0,
    voice: 0,
    text: 0,
  };

  try {
    const userSessions = await getMemberSessions(user.id);
    userSessions.forEach((row) => {
      sessions[row.medium] = row._count._all;
      sessions.total += row._count._all;
    });
  } catch (e) {
    log_error(e);
    embed.addFields({
      name: "Error",
      value: personalize[personal].error,
      inline: false,
    });
  }

  embed.addFields([
    {
      name: "Total Sessions",
      value: sessions.total.toString(),
      inline: false,
    },
    {
      name: "In Person Sessions",
      value: sessions.person.toString(),
      inline: false,
    },
    {
      name: "Video Sessions",
      value: sessions.video.toString(),
      inline: false,
    },
    {
      name: "Voice Sessions",
      value: sessions.voice.toString(),
      inline: false,
    },
    {
      name: "Text Sessions",
      value: sessions.text.toString(),
      inline: false,
    },
  ]);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    getBackButton(user.id, personal)
  );

  return {
    embeds: [embed],
    components: [row],
  };
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

function getBackButton(user: string, personal: string) {
  return new ButtonBuilder()
    .setLabel("❌")
    .setCustomId(`${scope}:${user};start;1;${personal}`)
    .setStyle(ButtonStyle.Primary);
}