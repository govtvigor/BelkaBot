// /api/checkSubscription.ts

import { VercelRequest, VercelResponse } from "@vercel/node";
import TelegramBot from "node-telegram-bot-api";


const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;

const TASK_CHANNEL_MAP: { [key: string]: string } = {
  joinTelegramChannel: process.env.TELEGRAM_CHANNEL_USERNAME as string,
  joinAnotherChannel: process.env.TELEGRAM_ANOTHER_CHANNEL_USERNAME as string,
};

if (!TELEGRAM_BOT_TOKEN) {
  throw new Error("Missing TELEGRAM_BOT_TOKEN in environment variables.");
}

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const { chatId, taskId } = req.body;

  if (!chatId || !taskId) {
    res.status(400).json({ error: "Missing chatId or taskId" });
    return;
  }

  // Check if the task is a Telegram task by looking it up in the TASK_CHANNEL_MAP
  if (TASK_CHANNEL_MAP[taskId]) {
    // Telegram Task: Implement your Telegram verification logic here
    // Example: Check if the user is a member of the specified Telegram channel
    // This requires using Telegram Bot API methods like getChatMember

    try {
      const chatMember = await bot.getChatMember(TASK_CHANNEL_MAP[taskId], chatId);

      if (chatMember && chatMember.status === "member") {
        // User is a member of the Telegram channel
        res.status(200).json({ isMember: true });
      } else {
        // User is not a member
        res.status(200).json({ isMember: false });
      }
    } catch (error) {
      console.error("Error checking Telegram membership:", error);
      res.status(500).json({ error: "Failed to verify Telegram membership." });
    }
  } else {
    res.status(400).json({ error: "Invalid taskId" });
  }
};
