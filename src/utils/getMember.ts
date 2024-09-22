import { log_error } from "./error";
import getGuild from "./getGuild";

export default async function getMember(memberID: string, guildID?: string) {
  const guild = await getGuild(guildID);

  if (/^\d+$/.test(memberID)) {
    try {
      return await guild.members.fetch(memberID);
    } catch (e) {
      log_error(e);
      throw new Error(`Member not found with ID ${memberID}`);
    }
  } else {
    try {
      const members = await guild.members.search({ query: memberID });

      if (members.size === 0)
        throw new Error(`No member found with name ${memberID}`);

      if (members.size === 1) {
        const member = members.first();
        if (member) return member;
        else throw new Error(`No member found with name ${memberID}`);
      }

      throw new Error(`Multiple members found with name ${memberID}`);
    } catch (e) {
      log_error(e);
      throw new Error(`Member not found with name ${memberID}`);
    }
  }
}
