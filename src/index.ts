import Announcements from "@components/announcements";
import AutoDeletes from "@components/autodeletes";
import DidSession from "@components/didSession";
import InfoCenter from "@components/infoCenter";
import SelfRoles from "@components/self_roles";
import Strikes from "@components/strikes";
import Tickets from "@components/tickets";
import { initializeInteractionCreated } from "@utils/events/interactionCreated";
import { initializeMessageCreated } from "@utils/events/messageCreated";
import { initializeMessageReactionAdd } from "@utils/events/messageReactionAdd";
import { initializeMessageReactionRemove } from "@utils/events/messageReactionRemove";
import Logger, { TicketLogger } from "@utils/Logger";
import { ActivityType, Client } from "discord.js";
import { config as dotenv } from "dotenv";
import db from "./db";
import { sql } from "drizzle-orm";

// Load environment variables from .env file‚
dotenv();

try{
  await db.execute(sql`select 1`);
} catch(e){
  console.error("Error connecting to database:", e);
  console.log("Check your database connection settings and try again.")
  process.exit(1)
}


// Create a new Discord client
const bot = new Client({
  intents: [
    "Guilds",
    "GuildMembers",
    "GuildModeration",
    "GuildVoiceStates",
    "GuildMessages",
    "GuildMessageReactions",
    "DirectMessages",
    "GuildInvites",
    "MessageContent",
  ],
});

export default bot;

// Event triggered when the bot is ready
bot.on("ready", async () => {
  console.log(`Logged in as ${bot.user?.tag}!`);

  // Set the bot's activity
  bot.user?.setActivity({
    name: "with minds since 2023!",
    type: ActivityType.Playing,
  });

  init();

  Logger.init();
  TicketLogger.init();

  SelfRoles();
  AutoDeletes();
  Announcements();
  Tickets();
  Strikes();
  DidSession();
  InfoCenter();
});

function init() {
  initializeInteractionCreated();
  initializeMessageCreated();
  initializeMessageReactionAdd();
  initializeMessageReactionRemove();
}

// Log in to Discord using the bot token from the .env file
bot.login(process.env.BOT_TOKEN);
