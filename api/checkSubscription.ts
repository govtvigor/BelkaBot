import { VercelRequest, VercelResponse } from "@vercel/node";
import TelegramBot from "node-telegram-bot-api";


const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
const TELEGRAM_CHANNEL_USERNAME = process.env.TELEGRAM_CHANNEL_USERNAME as string; // e.g., 'YourChannelName'

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_USERNAME) {
  throw new Error(
    "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_USERNAME in environment variables."
  );
}

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const { chatId } = req.body;

  if (!chatId) {
    res.status(400).json({ error: "Missing chatId" });
    return;
  }


  try {
    // Get chat member status
    const member = await bot.getChatMember(
      `@${TELEGRAM_CHANNEL_USERNAME}`,
      chatId
    );

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

    // Handle specific error codes based on Telegram API responses
    if (error.response && error.response.statusCode === 403) {
      // Bot is not an admin of the channel or cannot access member information
      res.status(500).json({
        error:
          "Bot is not an admin of the channel or cannot access member information.",
      });
    } else if (error.response && error.response.statusCode === 400) {
      // Bad Request. Possibly invalid chatId.
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
