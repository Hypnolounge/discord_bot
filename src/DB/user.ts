import { GuildMember } from "discord.js";
import prisma from ".";
import config from "./config";

export async function updateUser(member: GuildMember) {
  const id = parseInt(member.id);
  const primaryRole =
    member.roles.cache.find((role) =>
      Object.values(config.roles.primary).includes(role.id)
    )?.name || "Unknown";

  const continentRole =
    member.roles.cache.find((role) =>
      Object.values(config.roles.continent).forEach((continent) => {
        if (continent.role === role.id) {
          return true;
        }
      })
    )?.name || "Unknown";

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

export async function getPrevApplications(memberID: string) {
  try {
    const result = await prisma.tickets_application.groupBy({
      by: ["reason"],
      where: {
        userID: parseInt(memberID),
        reason: {
          not: undefined || "",
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
    throw new Error(`Error fetching previous applications for user ${memberID}`);
  }
}