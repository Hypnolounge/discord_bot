import { CategoryChannel } from "discord.js";
import TicketQuestion from "./ticketQuestion";


export class BaseTicket{
  title: string;
  description: string;
  emoji: string;
  category: CategoryChannel | undefined;
  questions: TicketQuestion[] = [];

  constructor(title: string, description: string, emoji: string, category?: CategoryChannel){
    this.title = title;
    this.description = description;
    this.emoji = emoji;
    this.category = category;
  }

  public openTicket(userID: string){
    console.log("Opening Ticket");
  }
}

