import { EmbedBuilder } from "discord.js";
import SelfRoleBaseSelector from "./baseSelector";

export default class SelfRoleSelectorMulti extends SelfRoleBaseSelector {
  public async init() {
    const message = await super.init();
    if (!message) return null;

    const currentReactions = message.reactions.cache;
    currentReactions.forEach((reaction) => {
      if (!this.getRoleByEmoji(reaction.emoji.name)) {
        reaction.remove();
      }
    });

    this.roles.forEach((role) => {
      message.react(role.emoji);
    });

    return message;
  }

  protected generateMessage() {
    var content = "";

    if (this.description) {
      content += this.description + "\n";
    }

    this.roles.forEach((role) => {
      if (!role.emoji || !role.description) return;
      content += `${role.emoji} : ${role.description}\n`;
    });

    const embed = new EmbedBuilder()
      .setTitle(this.title)
      .setDescription(content)
      .setFooter({ text: "PupNicky" });

    return { embeds: [embed], components: [] };
  }

  protected addListners() {
    this.client.on("messageReactionAdd", async (reaction, user) => {
      if (reaction.message.id !== this.messageID) return;
      if (user.bot) return;

      const role = this.getRoleByEmoji(reaction.emoji.name);
      if (!role) return;

      const member = await reaction.message.guild?.members.fetch(user.id);
      if (!member) return;
      
      role.addUserRole(member);
      this.emit("roleSelected", role, member);
    });

    this.client.on("messageReactionRemove", async (reaction, user) => {
      if (reaction.message.id !== this.messageID) return;
      if (user.bot) return;

      const role = this.getRoleByEmoji(reaction.emoji.name);
      if (!role) return;

      const member = await reaction.message.guild?.members.fetch(user.id);
      role.removeUserRole(member);
    });
  }
}
