import { GuildMember } from "discord.js";
import prisma from ".";
import config from "./config";

export async function addCompliment(
  userID: string,
  other: string,
  comment: string = ""
) {
  await prisma.compliments.create({
    data: {
      give: parseInt(userID),
      receive: parseInt(other),
      comment: comment,
    },
  });
}

export async function addSession(
  userID: string,
  type: string,
) {
  await prisma.sessions.create(
    {
      data: {
        userID: parseInt(userID),
        medium: type,
        date: ((new Date().getTime()) / 1000)
      }
    }
  )
}
