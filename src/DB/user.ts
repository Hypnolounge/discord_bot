import findIntro from "@utils/findIntro";
import getChannel from "@utils/getChannel";
import getMember from "@utils/getMember";
import getMessage from "@utils/getMessage";
import { getMemberContinent, getMemberPrimary, isUserMember } from "@utils/member";
import { GuildMember, Message } from "discord.js";
import prisma from ".";
import config from "./config";

export async function updateUser(member: GuildMember) {
  const id = member.id;
  const primaryRole = getMemberPrimary(member) || "Unknown";

  const continentRole = getMemberContinent(member) || "Unknown";

  return await prisma.users.upsert({
    where: {
      userID: id,
    },
    update: {
      displayname: member.user.displayName,
      continent: continentRole,
      primary: primaryRole,
    },
    create: {
      userID: id,
      displayname: member.user.displayName,
      continent: continentRole,
      primary: primaryRole,
      name: member.user.username,
    },
  });
}

export async function setIntro(memberID: string, message: Message) {
  return await prisma.intros.upsert({
    where: {
      userID: memberID,
    },
    update: {
      message: message.id,
      text: message.content,
    },
    create: {
      userID: memberID,
      message: message.id,
      text: message.content,
    },
  });
}

export async function getPrevApplications(memberID: string) {
  try {
    const result = await prisma.tickets_application.groupBy({
      by: ["reason"],
      where: {
        userID: memberID,
        reason: {
          not: "",
        },
      },
      _count: {
        _all: true,
      },
    });

    let content = "";
    result?.forEach((row) => {
      console.log(row);
      content += `${row.reason}: ${row._count._all} `;
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
    const result = await prisma.users.findUnique({
      where: {
        userID: memberID,
      },
    });

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
  return await prisma.sessions.groupBy({
    by: ["medium"],
    where: {
      userID: memberID,
    },
    _count: {
      _all: true,
    },
  });
}

export async function getMemberInfo(memberID: string) {
  let member = await prisma.users.findUnique({
    where: {
      userID: memberID,
    },
  });
  if (!member) {
    await updateUser(await getMember(memberID));
    member = await prisma.users.findUnique({
      where: {
        userID: memberID,
      },
    });
  }

  const intro = await prisma.intros.findFirst({
    where: {
      userID: memberID,
    },
  });

  let url = "Unknown";
  try {
    const message = await getMessage(intro?.message.toString() || "", await getChannel(config.channels.intros));
    url = message.url;
  } catch (error) {

  }

  if (url === "Unknown") {
    try{
      const msg = await findIntro(memberID);
      if(msg) {
        url = msg.url;
        setIntro(memberID, msg);
      }
    } catch (error) {
      console.error(error);
    }
  }
  
  const isMember = await isUserMember(memberID);

  return {member, url, isMember};
}

export async function getMemberStrikes(memberID: string) {
  return await prisma.strikes.findMany({
    where: {
      userID: memberID,
    },
  });
}

export async function getMemberCompliments(memberID: string) {
  return await prisma.compliments.findMany({
    where: {
      OR: [
        {
          give: memberID,
        },
        {
          receive: memberID,
        },
      ],
    },
  });
}
