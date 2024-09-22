import { log_error } from "./error";
import getGuild from "./getGuild";

export default async function getRole(roleID: string, guildID?: string) {
  const guildObject = await getGuild(guildID);
  try {
    const role = await guildObject.roles.fetch(roleID);
    if (!role) {
      throw new Error(`Role not found with ID ${roleID}`);
    }
    return role;
  } catch (e) {
    log_error(e);
    throw new Error(`Role not found with ID ${roleID}`);
  }
}
