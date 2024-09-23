import { TextChannelGroup } from "@typings/TextChannelGroup";
import { log_error } from "@utils/error";
import { bindInteractionCreated } from "@utils/events/interactionCreated";
import {
  ActionRowBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import SelfRoleBaseSelector from "./baseSelector";
import { SelfRole } from "./selfrole";

export default class SelfRoleSelectorSingle extends SelfRoleBaseSelector {
  placeholder: string;

  constructor(
    name: string,
    title: string,
    roles: SelfRole[],
    channel: TextChannelGroup,
    placeholder: string,
    description: string = ""
  ) {
    super(name, title, roles, channel, description);
    this.placeholder = placeholder;
  }

  protected generateMessage() {
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

  protected addListners() {
    bindInteractionCreated(
      this.name,
      "stringSelect",
      async (interaction, action) => {
        const role = this.roles.find(
          (role) => role.roleID === interaction.values[0]
        );
        if (!role) return;

        const member = await interaction.guild?.members.fetch(
          interaction.user.id
        );
        if (!member) return;

        const nonMatchingRoles = this.roles.filter((r) => r !== role);
        const nonMatchingRolesIDs = nonMatchingRoles.map((r) => r.roleID);
        try {
          await member.roles.remove(nonMatchingRolesIDs);
        } catch (error) {
          log_error(
            "Error removing roles in SelfRoleSelectorSingle " + this.name
          );
        }
        role.addUserRole(member);
        this.emit("roleSelected", role, member);

        interaction.reply({
          content: `You have selected the ${role.description} role!`,
          ephemeral: true,
        });
      }
    );
  }
}
