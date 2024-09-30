import { initializeInteractionCreated } from "@utils/events/interactionCreated";
import { initializeMessageCreated } from "@utils/events/messageCreated";
import { initializeMessageReactionAdd } from "@utils/events/messageReactionAdd";
import { initializeMessageReactionRemove } from "@utils/events/messageReactionRemove";
import Logger, { TicketLogger } from "@utils/Logger";
import { ActivityType, Client } from "discord.js";
import { config as dotenv } from "dotenv";
import SelfRoles from "./self_roles";
import Strikes from "./strikes";
import DidSession from "./didSession";

// Load environment variables from .env file
dotenv();

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
bot.on("ready", () => {
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
  //AutoDeletes();
  //Announcements();
  //Tickets();
  Strikes();
  DidSession();
});

function init() {
  initializeInteractionCreated();
  initializeMessageCreated();
  initializeMessageReactionAdd();
  initializeMessageReactionRemove();
}

// Log in to Discord using the bot token from the .env file
bot.login(process.env.BOT_TOKEN);
