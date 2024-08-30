import {
    ActionRowBuilder,
    Client,
    EmbedBuilder,
    GuildMember,
    Message,
    Role,
    StringSelectMenuBuilder,
} from "discord.js";
import { log_error } from "../utils/error";

export class SelfRole {
    role: Role;
    description: string;
    emoji: string;

    public constructor(role: Role, description: string, emoji: string) {
        this.role = role;
        this.description = description;
        this.emoji = emoji;
    }

    public addUserRole(member: GuildMember | undefined) {
        if (!member) {
            log_error("Member not found in SelfRole");
            return;
        }
        member.roles.add(this.role);
    }

    public removeUserRole(member: GuildMember | undefined) {
        if (!member) {
            log_error("Member not found in SelfRole");
            return;
        }
        member.roles.remove(this.role);
    }
}

export class SelfRoleCorrelation extends SelfRole {
    correlation: { [key: string]: Role };

    public constructor(
        role: Role,
        description: string,
        emoji: string,
        correlation: { [key: string]: Role }
    ) {
        super(role, description, emoji);
        this.correlation = correlation;
    }

    public addUserRole(member: GuildMember | undefined) {
        if (!member) {
            log_error("Member not found in SelfRole");
            return;
        }

        for (const [key, role] of Object.entries(this.correlation)) {
            if (member.roles.cache.has(key)) {
                member.roles.add(role);
                break;
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
    title: string;
    description: string;
    roles: SelfRole[];
    messageID: string;
    channeID: string;

    public constructor(
        client: Client,
        title: string,
        roles: SelfRole[],
        messageID: string,
        channelID: string,
        description: string = ""
    ) {
        this.client = client;
        this.title = title;
        this.roles = roles;
        this.messageID = messageID;
        this.channeID = channelID;
        this.description = description;

        this.init();
    }

    private async init() {
        const exists = await this.checkMessage();
        if (!exists) {
            this.createNewMessage();
        } else {
            this.updateMessage(exists);
        }
        this.addListners();
    }

    public generateMessage() {
        const embed = new EmbedBuilder()
            .setColor("Grey")
            .setTitle(this.title)
            .setDescription(this.description)
            .setFooter({ text: "PupNicky" });
        return { embeds: [embed] };
    }

    public async checkMessage() {
        const channel = await this.client.channels.fetch(this.channeID);
        if (!channel || !channel.isTextBased()) {
            log_error("Channel not found in SelfRoleSelector");
            return false;
        }
        const message = await channel.messages.fetch(this.messageID);
        if (!message) {
            log_error("Message not found in SelfRoleSelector");
            return false;
        }
        return message;
    }

    public async updateMessage(message: Message) {
        const newMessage = this.generateMessage();
        if (message.embeds[0].data != newMessage.embeds[0].data) {
            message.edit(newMessage);
            return true;
        }
        return false;
    }

    public async createNewMessage() {
        const channel = await this.client.channels.fetch(this.channeID);
        if (!channel || !channel.isTextBased()) {
            log_error("Channel not found in SelfRoleSelector");
            return false;
        }
        const newMessage = this.generateMessage();
        const message = await channel.send(newMessage);
        this.messageID = message.id;
        return message;
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
            content += `${role.emoji} : ${role.description}\n`;
        });

        const embed = new EmbedBuilder()
            .setColor("Grey")
            .setTitle(this.title)
            .setDescription(content)
            .setFooter({ text: "PupNicky" });

        return { embeds: [embed] };
    }

    public async updateMessage(message: Message) {
        const updated = super.updateMessage(message);

        const currentReactions = message.reactions.cache;
        currentReactions.forEach((reaction) => {
            if (
                !this.roles.find((role) => role.emoji === reaction.emoji.name)
            ) {
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
        if (!message) return false;

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
        title: string,
        roles: SelfRole[],
        messageID: string,
        channelID: string,
        placeholder: string,
        description: string = ""
    ) {
        super(client, title, roles, messageID, channelID, description);
        this.placeholder = placeholder;
    }

    public generateMessage() {
        const message = super.generateMessage() as {
            embeds: EmbedBuilder[];
            components: any[];
        };

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(this.messageID)
            .setPlaceholder(this.placeholder)
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(
                this.roles.map((role) => {
                    return {
                        label: role.description,
                        value: role.role.id,
                        emoji: role.emoji,
                    };
                })
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);
        message.components = [row];
        return message;
    }

    public async updateMessage(message: Message) {
        const updated = super.updateMessage(message);
        if (!updated) return true;
        const newMessage = this.generateMessage();

        const newSelectMenu = newMessage.components;
        const selectMenu = message.components;

        if (selectMenu.length !== newSelectMenu.length) {
            message.edit(newMessage);
            return true;
        }

        return false;
    }

    public addListners() {
        this.client.on("interactionCreate", async (interaction) => {
            if (!interaction.isStringSelectMenu()) return;
            if (interaction.customId !== this.messageID) return;

            const role = this.roles.find(
                (role) => role.role.id === interaction.values[0]
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
        });
    }
}
