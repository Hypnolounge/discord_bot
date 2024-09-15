import { BaseTicket } from "./ticket";

export default class TicketType {
  name: string;
  description: string;
  ticketClass: BaseTicket;
  
  constructor(name: string, description: string, ticketClass: BaseTicket) {
    this.name = name;
    this.description = description;
    this.ticketClass = ticketClass;
  }
}
