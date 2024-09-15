import { Client } from "discord.js";
import TicketOpener from "./class/tickets/ticketOpener";
import getChannel from "./utils/getChannel";
import config from "./DB/config";
import { BaseTicket } from "./class/tickets/ticket";

export default function Tickets(client: Client) {
  DefaultTicketOpener(client);
}

async function DefaultTicketOpener(client: Client) {
  const channel = await getChannel(config.channels.tickets);

  if (!channel || !channel.isTextBased()) {
    console.error("Tickets channel not found");
    return;
  }

  const types = [
    {
      name: "Application",
      description: "You would like to become a member of the Hypnolounge.",
      ticketClass: {} as any,
    },
    {
      name: "Issues",
      description: "You would like to report an issue in general ranging from bugs, to server issues, to serious incidents.",
      ticketClass: {} as any,
    },
    {
      name: "Misc",
      description: "For anything else.",
      ticketClass: {} as any,
    },
  ];

  const ticketOpener = new TicketOpener(
    client,
    "default_ticket_opener",
    "Open a ticket",
    channel,
    types,
    "Open a ticket here to get help from the staff team."
  );

  await ticketOpener.init();
}
