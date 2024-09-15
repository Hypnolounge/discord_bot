import { GuildMember, Role } from "discord.js";
import { log_error } from "../../utils/error";
import getRole from "../../utils/getRole";

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
      log_error("Role not found in SelfRole " + this.description);
      return;
    }
  }

  public addUserRole(member: GuildMember | undefined) {
    if (!this.role) {
      this.init();
      return;
    }
    if (!member) {
      log_error("Member not found in SelfRole " + this.description);
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
      log_error("Member not found in SelfRole " + this.description);
      return;
    }
    member.roles.remove(this.role);
  }
}

export class SelfRoleCorrelation extends SelfRole {
  correlation: { [key: string]: string };

  public constructor(
    description: string,
    emoji: string,
    correlation: { [key: string]: string }
  ) {
    super("", description, emoji);
    this.correlation = correlation;
  }

  public addUserRole(member: GuildMember | undefined) {
    if (!member) {
      log_error("Member not found in SelfRole " + this.description);
      return;
    }

    for (const [key, roleID] of Object.entries(this.correlation)) {
      if (member.roles.cache.has(key)) {
        const role = member.guild.roles.cache.get(roleID);
        if (role) {
          member.roles.add(role);
        } else {
          log_error("Role not found in SelfRole " + this.description);
        }
      }
    }
  }

  public removeUserRole(member: GuildMember | undefined) {
    if (!member) {
      log_error("Member not found in SelfRole " + this.description);
      return;
    }

    for (const role of Object.values(this.correlation)) {
      member.roles.remove(role);
    }
  }
}
