import { ActionRowBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export default class TicketQuestion {
  title: string;
  required: boolean;
  type: TextInputStyle;
  placeholder: string;

  constructor(
    title: string,
    required: boolean,
    type: TextInputStyle,
    placeholder: string = ""
  ) {
    this.title = title;
    this.required = required;
    this.type = type;
    this.placeholder = placeholder;
  }

  public generateComponent() {
    const component = new TextInputBuilder()
      .setCustomId(this.title)
      .setRequired(this.required)
      .setLabel(this.title)
      .setStyle(this.type);

    if (this.placeholder) component.setPlaceholder(this.placeholder);

    const row = new ActionRowBuilder<TextInputBuilder>().addComponents(
      component
    );
    return row;
  }
}
