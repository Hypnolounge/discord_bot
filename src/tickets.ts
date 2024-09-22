import { TicketCreator } from "@class/tickets/ticket";
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
  Client,
  EmbedBuilder,
  TextInputStyle,
} from "discord.js";
import prisma from "./db";

const ticketAutoMessage = [
  "Welcome to the Hypnolounge! We're sure you're excited to enter and do all the horny things you'd like to do, but before anything, please answer these questions.",
  "1. How did you find the Hypnolounge?",
  "2. What got you into hypnosis and why you're into hypnosis?",
  "3. Could you share a particular experience you've had with hypnosis, if you have any?",
  "4. Do you have any hobbies or kinks besides hypnosis?",
  "5. What's the password? If you don't know the password, go back to https://discord.com/channels/1125008815272759408/1125011563670163497 and look for it there. We can't tell you where it is because we actually want you to read the rules.",
  "6. Please send us some proof of your age. Read the https://discord.com/channels/1125008815272759408/1232397100310986752 for what kind we will accept.",
];

export default async function Tickets(client: Client) {
  const channel = await getChannel(config.channels.tickets);

  if (!channel || !channel.isTextBased()) {
    log_error("Ticket channel not found");
    return;
  }

  const ticketTypes = [
    ApplicationTicket(client),
    IssueTicket(client),
    MiscTicket(client),
  ];

  const message = await checkMessage(
    "ticket_opener",
    channel,
    generateMessage(ticketTypes)
  );
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

function ApplicationTicket(client: Client) {
  const extraButtons = {
    approved: new ButtonBuilder()
      .setLabel("Approve")
      .setStyle(ButtonStyle.Success),

    incomplete: new ButtonBuilder()
      .setLabel("Incomplete")
      .setStyle(ButtonStyle.Danger),

    denied: new ButtonBuilder().setLabel("Deny").setStyle(ButtonStyle.Danger),

    expired: new ButtonBuilder()
      .setLabel("Expired")
      .setStyle(ButtonStyle.Primary),
  };

  return new TicketOpener(
    client,
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
      client,
      "application",
      config.categories.applications,
      prisma.tickets_application,
      ticketAutoMessage,
      extraButtons
    )
  );
}

function IssueTicket(client: Client) {
  return new TicketOpener(
    client,
    "issue_opener",
    "Issue",
    "You would like to report an issue in general ranging from bugs, to server issues, to serious incidents.",
    [
      new TicketQuestion("Type of Issue", true, TextInputStyle.Short),
      new TicketQuestion("Events", true, TextInputStyle.Paragraph),
      new TicketQuestion("People Involved", false, TextInputStyle.Paragraph),
    ],
    new TicketCreator<Prisma.tickets_issueDelegate>(
      client,
      "issue",
      config.categories.issues,
      prisma.tickets_issue
    )
  );
}

function MiscTicket(client: Client) {
  return new TicketOpener(
    client,
    "misc_opener",
    "Misc",
    "Anything else. (including invites)",
    [],
    new TicketCreator<Prisma.tickets_miscDelegate>(
      client,
      "misc",
      config.categories.misc,
      prisma.tickets_misc
    )
  );
}
