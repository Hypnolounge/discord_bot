import findIntro from "@utils/findIntro";
import getChannel from "@utils/getChannel";
import getMember from "@utils/getMember";
import getMessage from "@utils/getMessage";
import {
  getMemberContinent,
  getMemberPrimary,
  isUserMember,
} from "@utils/member";
import { GuildMember, Message } from "discord.js";
import db from ".";
import config from "./config";
import users from "./schema/users";
import intros from "./schema/intros";
import strikes from "./schema/strikes";
import { eq, or, sql } from "drizzle-orm";
import compliments from "./schema/compliments";
import sessions from "./schema/sessions";
import { ticketsApplication } from "./schema/tickets";

export async function updateUser(member: GuildMember) {
  const id = member.id;
  const primaryRole = getMemberPrimary(member) || "Unknown";

  const continentRole = getMemberContinent(member) || "Unknown";
  return await db
    .insert(users)
    .values({
      userId: id,
      displayname: member.user.displayName,
      continent: continentRole,
      primary: primaryRole,
      name: member.user.username,
    })
    .onConflictDoUpdate({
      target: users.userId,
      set: {
        userId: id,
        displayname: member.user.displayName,
        continent: continentRole,
        primary: primaryRole,
        name: member.user.username,
      },
    });
}

export async function setIntro(memberID: string, message: Message) {
  return await db
    .insert(intros)
    .values({
      userID: memberID,
      message: message.id,
      text: message.content,
    })
    .onConflictDoUpdate({
      target: intros.userID,
      set: {
        userID: memberID,
        message: message.id,
        text: message.content,
      },
    });
}

export async function getPrevApplications(memberID: string) {
  try {
    const result = await db
      .select({
        reason: ticketsApplication.reason,
        count: sql<number>`cast(count(${ticketsApplication.reason}) as int)`,
      })
      .from(ticketsApplication)
      .where(eq(ticketsApplication.userID, memberID))
      .groupBy(ticketsApplication.reason);

    let content = "";
    result?.forEach((row) => {
      console.log(row);
      content += `${row.reason}: ${row.count} `;
    });

    return content;
  } catch (error) {
    console.error(error);
    throw new Error(
      `Error fetching previous applications for user ${memberID}`
    );
  }
}

export async function getPrimaryRole(memberID: string) {
  try {
    const result = (
      await db.select().from(users).where(eq(users.userId, memberID))
    )[0];

    if (result && result.primary !== "Unknown") return result.primary;

    const member = await getMember(memberID);
    const primary = getMemberPrimary(member);

    if (primary) {
      updateUser(member);
      return primary;
    }

    return "Unknown";
  } catch (error) {
    console.error(error);
    return "Unknown";
  }
}

export async function getMemberSessions(memberID: string) {
  return await db
    .select({
      medium: sessions.medium,
      count: sql<number>`cast(count(${users.userId}) as int)`,
    })
    .from(sessions)
    .where(eq(sessions.userId, memberID))
    .groupBy(sessions.medium);
}

export async function getMemberInfo(memberID: string) {
  let member = (
    await db.select().from(users).where(eq(users.userId, memberID))
  )[0];

  if (!member) {
    await updateUser(await getMember(memberID));
    member = (
      await db.select().from(users).where(eq(users.userId, memberID))
    )[0];
  }

  const intro = (
    await db.select().from(intros).where(eq(intros.userID, memberID))
  )[0];

  let url = "Unknown";
  try {
    const message = await getMessage(
      intro?.message.toString() || "",
      await getChannel(config.channels.intros)
    );
    url = message.url;
  } catch (error) {}

  if (url === "Unknown") {
    try {
      const msg = await findIntro(memberID);
      if (msg) {
        url = msg.url;
        setIntro(memberID, msg);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const isMember = await isUserMember(memberID);

  return { member, url, isMember };
}

export async function getMemberStrikes(memberID: string) {
  return await db.select().from(strikes).where(eq(strikes.userID, memberID));
}

export async function getMemberCompliments(memberID: string) {
  return await db
    .select()
    .from(compliments)
    .where(
      or(eq(compliments.give, memberID), eq(compliments.receive, memberID))
    );
}
