import { CloseOptions, TicketCreator } from "@class/tickets/ticket";
import TicketOpener from "@class/tickets/ticketOpener";
import TicketQuestion from "@class/tickets/ticketQuestion";
import config from "@db/config";
import { Prisma } from "@prisma/client";
import { log_error } from "@utils/error";
import getChannel from "@utils/getChannel";
import checkMessage, { MessageOptions } from "@utils/message/checkMessage";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  TextInputStyle,
} from "discord.js";
import prisma from "@db/index";

const ticketAutoMessage = [
  "Welcome to the Hypnolounge! We're sure you're excited to enter and do all the horny things you'd like to do, but before anything, please answer these questions.",
  "1. How did you find the Hypnolounge?",
  "2. What got you into hypnosis and why you're into hypnosis?",
  "3. Could you share a particular experience you've had with hypnosis, if you have any?",
  "4. Do you have any hobbies or kinks besides hypnosis?",
  "5. What's the password? If you don't know the password, go back to https://discord.com/channels/1125008815272759408/1125011563670163497 and look for it there. We can't tell you where it is because we actually want you to read the rules.",
  "6. Please send us some proof of your age. Read the https://discord.com/channels/1125008815272759408/1232397100310986752 for what kind we will accept.",
];

export default async function Tickets() {
  try {
    const channel = await getChannel(config.channels.tickets);

    const ticketTypes = [ApplicationTicket(), IssueTicket(), MiscTicket()];

    const message = await checkMessage(
      "ticket_opener",
      channel,
      generateMessage(ticketTypes)
    );
  } catch (error) {
    log_error(error);
  }
}

function generateMessage(types: TicketOpener[]) {
  let content = "### Choose one of the options below";
  const row = new ActionRowBuilder<ButtonBuilder>();

  types.forEach((type) => {
    content += `\n${type.title}: ${type.description}`;
    row.addComponents(type.getButton());
  });

  const embed = new EmbedBuilder()
    .setTitle("Tickets")
    .setDescription(content)
    .setColor("Blurple")
    .setFooter({ text: "PupNicky" });

  return { embeds: [embed], components: [row] } as MessageOptions;
}

function ApplicationTicket() {
  const closeOptions: CloseOptions = {
    approved: {
      button: new ButtonBuilder()
        .setLabel("Approve")
        .setStyle(ButtonStyle.Success),
      message:
        "Welcome! Head to https://discord.com/channels/1125008815272759408/1125014789450641458 and introduce yourself there. Then, you will be able to choose a role. Choose a primary role, then come and say hi in General!",
      closeAction: async (member) => {
        await member.roles.add(config.roles.member);
      },
    },

    incomplete: {
      button: new ButtonBuilder()
        .setLabel("Incomplete")
        .setStyle(ButtonStyle.Danger),
      message:
        "You have failed to read the rules properly and have missed a step in the application procedure that is clearly stated in the rules. Feel free to try again, but we are denying you for now. (https://discord.gg/Caz6NHR2Zu)",
    },

    denied: {
      button: new ButtonBuilder().setLabel("Deny").setStyle(ButtonStyle.Danger),
      message:
        "You haven't convinced us that you would be a good fit in the Hypnolounge. We want our members to be able to contribute to a friendly community by being themselves and not just random horny strangers on the internet. The Hypnolounge is a place of discussion and rapport, not a place for random hookups like Grindr. There is another server, Hypnosis for Guys, where they would rather just get on with the hypnosis and do nothing else. We think you would be a much better fit there: https://hypnosisforguys.com/",
      closeAction: async (member) => {
        await member.ban({ reason: "Denied application" });
      },
    },

    expired: {
      button: new ButtonBuilder()
        .setLabel("Expired")
        .setStyle(ButtonStyle.Primary),
      message:
        "You have taken longer than three days to finish your application. Feel free to try again, but we are denying you for now. (https://discord.gg/Caz6NHR2Zu)",
    },
    closed: {
      button: new ButtonBuilder()
        .setLabel("Close")
        .setStyle(ButtonStyle.Secondary),
      message: "The ticket has been closed.",
    },
  };

  return new TicketOpener(
    "application",
    "Application",
    "You would like to become a member of the Hypnolounge.",
    [
      new TicketQuestion("Age", true, TextInputStyle.Short),
      new TicketQuestion(
        "Location",
        false,
        TextInputStyle.Short,
        "Tell us where you're from (country)"
      ),
      new TicketQuestion(
        "Role",
        true,
        TextInputStyle.Short,
        "Hypnotist, Subject, Switch or Undecided"
      ),
      new TicketQuestion(
        "Years of hypnosis experience",
        true,
        TextInputStyle.Short
      ),
    ],
    new TicketCreator<Prisma.tickets_applicationDelegate>(
      "application",
      config.categories.applications,
      prisma.tickets_application,
      ticketAutoMessage,
      closeOptions
    )
  );
}

function IssueTicket() {
  return new TicketOpener(
    "issue_opener",
    "Issue",
    "You would like to report an issue in general ranging from bugs, to server issues, to serious incidents.",
    [
      new TicketQuestion("Type of Issue", true, TextInputStyle.Short),
      new TicketQuestion("Events", true, TextInputStyle.Paragraph),
      new TicketQuestion("People Involved", false, TextInputStyle.Paragraph),
    ],
    new TicketCreator<Prisma.tickets_issueDelegate>(
      "issue",
      config.categories.issues,
      prisma.tickets_issue
    )
  );
}

function MiscTicket() {
  return new TicketOpener(
    "misc_opener",
    "Misc",
    "Anything else. (including invites)",
    [],
    new TicketCreator<Prisma.tickets_miscDelegate>(
      "misc",
      config.categories.misc,
      prisma.tickets_misc
    )
  );
}
