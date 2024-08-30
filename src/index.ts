import { Client } from "discord.js";
import { config as dotenv } from "dotenv";

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

// Event triggered when the bot is ready
bot.on("ready", () => {
  console.log(`Logged in as ${bot.user?.tag}!`);
});

export default bot;


// Log in to Discord using the bot token from the .env file
bot.login(process.env.BOT_TOKEN);
