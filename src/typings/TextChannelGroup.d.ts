import { NewsChannel, PrivateThreadChannel, PublicThreadChannel, StageChannel, TextChannel, VoiceChannel } from "discord.js"

export type TextChannelGroup = TextChannel | NewsChannel | StageChannel | PublicThreadChannel<boolean> | PrivateThreadChannel | VoiceChannel