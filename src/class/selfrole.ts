import {
  ActionRowBuilder,
  Client,
  EmbedBuilder,
  GuildMember,
  Message,
  Role,
  StringSelectMenuBuilder,
  TextBasedChannel,
} from "discord.js";
import { log_error } from "../utils/error";
import getRole from "../utils/getRole";
import { setKeyValue } from "../DB/keyValueStore";

export class SelfRole {
  roleID: string;
  description: string;
  emoji: string;
  role: Role | undefined | null;

  public constructor(roleID: string, description: string, emoji: string) {
    this.roleID = roleID;
    this.description = description;
    this.emoji = emoji;
    this.init();
  }

  public async init() {
    this.role = await getRole(this.roleID);
    if (!this.role) {
      log_error("Role not found in SelfRole");
      return;
    }
  }

  public addUserRole(member: GuildMember | undefined) {
    if (!this.role) {
      this.init();
      return;
    }
    if (!member) {
      log_error("Member not found in SelfRole");
      return;
    }
    member.roles.add(this.role);
  }

  public removeUserRole(member: GuildMember | undefined) {
    if (!this.role) {
      this.init();
      return;
    }
    if (!member) {
      log_error("Member not found in SelfRole");
      return;
    }
    member.roles.remove(this.role);
  }
}

export class SelfRoleCorrelation extends SelfRole {
  correlation: { [key: string]: string };

  public constructor(
    roleID: string,
    description: string,
    emoji: string,
    correlation: { [key: string]: string }
  ) {
    super(roleID, description, emoji);
    this.correlation = correlation;
  }

  public addUserRole(member: GuildMember | undefined) {
    if (!member) {
      log_error("Member not found in SelfRole");
      return;
    }

    for (const [key, roleID] of Object.entries(this.correlation)) {
      if (member.roles.cache.has(key)) {
        const role = member.guild.roles.cache.get(roleID);
        if (role) {
          member.roles.add(role);
        } else {
          log_error("Role not found in SelfRole");
        }
      }
    }
  }

  public removeUserRole(member: GuildMember | undefined) {
    if (!member) {
      log_error("Member not found in SelfRole");
      return;
    }

    for (const role of Object.values(this.correlation)) {
      member.roles.remove(role);
    }
  }
}

class SelfRoleSelector {
  client: Client;
  name: string;
  title: string;
  description: string;
  roles: SelfRole[];
  messageID: string;
  channel: TextBasedChannel;

  constructor(
    client: Client,
    name: string,
    title: string,
    roles: SelfRole[],
    messageID: string,
    channel: TextBasedChannel,
    description: string = ""
  ) {
    this.client = client;
    this.name = name;
    this.title = title;
    this.roles = roles;
    this.messageID = messageID;
    this.channel = channel;
    this.description = description;
  }

  public async init() {
    const message = await this.checkMessage();

    if (!message) {
      this.createNewMessage();
    } else {
      this.updateMessage(message);
    }
    this.addListners();
  }

  public generateMessage() {
    const embed = new EmbedBuilder()
      .setTitle(this.title)
      .setDescription(this.description)
      .setFooter({ text: "PupNicky" });
    return { embeds: [embed], components: [] as ActionRowBuilder<any>[] };
  }

  public async checkMessage() {
    try {
      const message = await this.channel.messages.fetch(this.messageID);
      return message;
    } catch (error) {
      log_error("Message not found in SelfRoleSelector");
      return false;
    }
  }

  public async updateMessage(message: Message) {
    const newMessage = this.generateMessage();
    message.edit(newMessage);
    return true;
  }

  public async createNewMessage() {
    const newMessage = this.generateMessage();
    try {
      const message = await this.channel.send(newMessage);
      this.messageID = message.id;
      setKeyValue(this.name, this.messageID);
      return message;
    } catch (error) {
      log_error("Message not sent in SelfRoleSelector");
      return false;
    }
  }

  public getRoleByEmoji(emoji: string | null) {
    if (!emoji) return;
    return this.roles.find((role) => role.emoji === emoji);
  }

  public addListners() {}
}

export class SelfRoleSelectorMulti extends SelfRoleSelector {
  public generateMessage() {
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

  public async updateMessage(message: Message) {
    const updated = super.updateMessage(message);

    const currentReactions = message.reactions.cache;
    currentReactions.forEach((reaction) => {
      if (!this.roles.find((role) => role.emoji === reaction.emoji.name)) {
        reaction.remove();
      }
    });

    this.roles.forEach((role) => {
      message.react(role.emoji);
    });

    return updated;
  }

  public async createNewMessage() {
    const message = await super.createNewMessage();
    if (!message) return message;

    this.roles.forEach((role) => {
      message.react(role.emoji);
    });

    return message;
  }

  public addListners() {
    this.client.on("messageReactionAdd", async (reaction, user) => {
      if (reaction.message.id !== this.messageID) return;
      if (user.bot) return;

      const role = this.getRoleByEmoji(reaction.emoji.name);
      if (!role) return;

      const member = await reaction.message.guild?.members.fetch(user.id);
      role.addUserRole(member);
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

export class SelfRoleSelectorSingle extends SelfRoleSelector {
  placeholder: string;

  constructor(
    client: Client,
    name: string,
    title: string,
    roles: SelfRole[],
    messageID: string,
    channel: TextBasedChannel,
    placeholder: string,
    description: string = ""
  ) {
    super(client, name, title, roles, messageID, channel, description);
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
      nonMatchingRoles.forEach((r) => {
        r.removeUserRole(member);
      });
      role.addUserRole(member);

      interaction.reply({
        content: `You have selected the ${role.description} role!`,
        ephemeral: true,
      });
    });
  }
}
