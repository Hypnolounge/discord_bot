import bot from "@bot";
import {
  ButtonInteraction,
  CommandInteraction,
  ModalSubmitInteraction,
  StringSelectMenuInteraction,
} from "discord.js";

type InteractionTypes = "button" | "modal" | "command" | "stringSelect";

interface Callback<T> {
  (interaction: T, action: string, customId?:string): any;
}

interface Register {
  [key: string]: Callback<any>;
}

const actions = {
  button: {} as Register,
  modal: {} as Register,
  command: {} as Register,
  stringSelect: {} as Register,
};

export function initializeInteractionCreated() {
  bot.on("interactionCreate", async (interaction) => {
    if (interaction.user.bot) return;

    if (interaction.isCommand()) {
      const handler = actions.command[interaction.commandName];
      if (!handler) return;
      handler(interaction, interaction.commandName);
    }

    if (interaction.isStringSelectMenu()) {
      const [scope, action] = interaction.customId.split(":", 2);
      const handler = actions.stringSelect[scope];
      if (!handler) return;
      handler(interaction, action, interaction.customId);
    }

    if (interaction.isButton()) {
      const [scope, action] = interaction.customId.split(":", 2);
      const handler = actions.button[scope];
      if (!handler) return;
      
      handler(interaction, action, interaction.customId);
    }

    if (interaction.isModalSubmit()) {
      const [scope, action] = interaction.customId.split(":", 2);
      const handler = actions.modal[scope];
      if (!handler) return;
      handler(interaction, action, interaction.customId);
    }
  });
}

export function bindInteractionCreated(
  scope: string,
  type: "button",
  callback: Callback<ButtonInteraction>
): void;

export function bindInteractionCreated(
  scope: string,
  type: "modal",
  callback: Callback<ModalSubmitInteraction>
): void;

export function bindInteractionCreated(
  scope: string,
  type: "command",
  callback: Callback<CommandInteraction>
): void;

export function bindInteractionCreated(
  scope: string,
  type: "stringSelect",
  callback: Callback<StringSelectMenuInteraction>
): void;

// Implementation
export function bindInteractionCreated(
  scope: string,
  type: InteractionTypes,
  callback: Callback<any>
): void {
  actions[type][scope] = callback;
}
