import bot from "../index";
import { log_error } from "./error";

export default async function getUser(memberID: string) {
  try {
    return await bot.users.fetch(memberID);
  } catch (e) {
    log_error(e);
    throw new Error(`User not found with ID ${memberID}`);
  }
}
