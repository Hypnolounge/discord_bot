import config from "@db/config";
import { GuildMember } from "discord.js";
import getMember from "./getMember";

export function getMemberPrimary(member: GuildMember): string | undefined {
  return member.roles.cache.find((role) =>
    Object.values(config.roles.primary).includes(role.id)
  )?.name;
}

export function getMemberContinent(member: GuildMember): string | undefined {
  return member.roles.cache.find((role) => {
    for (const continent of config.roles.continent) {
      if (continent.role === role.id) {
        console.log(continent.desc);
        return true;
      }
    }
  }
  )?.name;
}

export function hasMemberRole(member: GuildMember, roleID: string): boolean {
  return member.roles.cache.has(roleID);
}

export async function isUserMember(memberID: string): Promise<string> {
  try {
    const member = await getMember(memberID);
    let isMember = "This user is not a member of the server!";

    if (hasMemberRole(member, config.roles.accepted)) {
      isMember = "This user is accepted but not a member of the server!";
    }

    if (hasMemberRole(member, config.roles.member)) {
      isMember = "This user is a member of the server!";
    }
    return isMember;
  } catch (error) {
    return "This user is not a member of the server!";
  }
}
