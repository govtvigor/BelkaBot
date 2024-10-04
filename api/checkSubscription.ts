// checkSubscription.ts

import { VercelRequest, VercelResponse } from "@vercel/node";
import TelegramBot from "node-telegram-bot-api";

// Retrieve the Telegram bot token from environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;

// Mapping of task IDs to Telegram channel usernames
const TASK_CHANNEL_MAP: { [key: string]: string } = {
  joinTelegramChannel: process.env.TELEGRAM_CHANNEL_USERNAME as string, // Existing channel
  joinAnotherChannel: process.env.TELEGRAM_ANOTHER_CHANNEL_USERNAME as string, // New channel
};

// Validate that the necessary environment variables are set
if (!TELEGRAM_BOT_TOKEN) {
  throw new Error("Missing TELEGRAM_BOT_TOKEN in environment variables.");
}

// Initialize the Telegram bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

// Export the default async function to handle the API request
export default async (req: VercelRequest, res: VercelResponse) => {
  // Allow only POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  // Extract chatId and taskId from the request body
  const { chatId, taskId } = req.body;

  // Validate that both chatId and taskId are provided
  if (!chatId || !taskId) {
    res.status(400).json({ error: "Missing chatId or taskId" });
    return;
  }

  // Retrieve the channel username based on the taskId
  const channelUsername = TASK_CHANNEL_MAP[taskId];
  if (!channelUsername) {
    res.status(400).json({ error: "Invalid taskId" });
    return;
  }

  try {
    // Use the Telegram bot to get the chat member status
    const member = await bot.getChatMember(`@${channelUsername}`, chatId);

    // Determine if the user is a member, administrator, or creator of the channel
    if (
      member.status === "member" ||
      member.status === "administrator" ||
      member.status === "creator"
    ) {
      res.status(200).json({ isMember: true });
    } else {
      res.status(200).json({ isMember: false });
    }
  } catch (error: any) {
    console.error("Error checking subscription:", error.message || error);

    // Handle specific Telegram API error codes
    if (error.response && error.response.statusCode === 403) {
      // Bot lacks necessary permissions
      res.status(500).json({
        error:
          "Bot is not an admin of the channel or cannot access member information.",
      });
    } else if (error.response && error.response.statusCode === 400) {
      // Bad request, possibly due to invalid chatId
      res.status(400).json({ error: "Bad Request. Possibly invalid chatId." });
    } else if (error.response && error.response.statusCode === 404) {
      // Chat not found
      res.status(404).json({ error: "Chat not found." });
    } else {
      // General server error
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};