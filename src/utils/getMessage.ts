import { TextChannelGroup } from "@typings/TextChannelGroup";
import { log_error } from "./error";

export default async function getMessage(msgID: string, channel: TextChannelGroup) {
  try{
    const message = await channel.messages.fetch(msgID);
    return message;
  } catch (e) {
    log_error(e);
    throw new Error(`Message not found with ID ${msgID}`);
  }
}