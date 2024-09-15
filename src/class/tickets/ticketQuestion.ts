

export default class TicketQuestion {
  title: string;
  description: string;
  emoji: string;
  required: boolean;
  type: string;
  options: string[] | undefined;
  constructor(title: string, description: string, emoji: string, required: boolean, type: string, options?: string[]) {
    this.title = title;
    this.description = description;
    this.emoji = emoji;
    this.required = required;
    this.type = type;
    this.options = options;
  }
} 