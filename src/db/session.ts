import { GuildMember } from "discord.js";
import db from ".";
import config from "./config";
import compliments from "./schema/compliments";
import sessions from "./schema/sessions";

export async function addCompliment(
  userID: string,
  other: string,
  comment: string = ""
) {
  return await db.insert(compliments).values({
    give: userID,
    receive: other,
    comment: comment,
  });
}

export async function addSession(userID: string, type: string) {
  return await db.insert(sessions).values({
    userId: userID,
    medium: type,
  })
}
