import {
  Client,
  TextBasedChannel,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import { log_error } from "../../utils/error";
import SelfRoleBaseSelector from "./baseSelector";
import { SelfRole } from "./selfrole";

export default class SelfRoleSelectorSingle extends SelfRoleBaseSelector {
  placeholder: string;

  constructor(
    client: Client,
    name: string,
    title: string,
    roles: SelfRole[],
    channel: TextBasedChannel,
    placeholder: string,
    description: string = ""
  ) {
    super(client, name, title, roles, channel, description);
    this.placeholder = placeholder;
  }

  public generateMessage() {
    const message = super.generateMessage() as {
      embeds: EmbedBuilder[];
      components: ActionRowBuilder<StringSelectMenuBuilder>[];
    };

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(this.name)
      .setPlaceholder(this.placeholder)
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(
        this.roles.map((role) => {
          if (!role.emoji) {
            return { label: role.description, value: role.roleID };
          }
          return {
            label: role.description,
            value: role.roleID,
            emoji: role.emoji,
          };
        })
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      selectMenu
    );
    message.components = [row];
    return message;
  }

  public addListners() {
    this.client.on("interactionCreate", async (interaction) => {
      if (!interaction.isStringSelectMenu()) return;
      if (interaction.customId !== this.name) return;
      const role = this.roles.find(
        (role) => role.roleID === interaction.values[0]
      );
      if (!role) return;

      const member = await interaction.guild?.members.fetch(
        interaction.user.id
      );

      const nonMatchingRoles = this.roles.filter((r) => r !== role);
      const nonMatchingRolesIDs = nonMatchingRoles.map((r) => r.roleID);
      try {
        await member?.roles.remove(nonMatchingRolesIDs);
      } catch (error) {
        log_error(
          "Error removing roles in SelfRoleSelectorSingle " + this.name
        );
      }
      role.addUserRole(member);

      interaction.reply({
        content: `You have selected the ${role.description} role!`,
        ephemeral: true,
      });
    });
  }
}
