import { VercelRequest, VercelResponse } from '@vercel/node';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
const vercelAppUrl = process.env.VERCEL_URL || 'https://belka-bot.vercel.app';  // Replace with your actual Vercel URL

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

// Set up webhook
bot.setWebHook(`${vercelAppUrl}/api/webhook`);

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    console.log('Incoming webhook request body:', JSON.stringify(req.body, null, 2));
    bot.processUpdate(req.body);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Error');
  }
};

// Bot command handling (e.g., "/start" or "/play")
bot.onText(/\/(start|play)/, async (msg) => {
  const chatId = msg.chat.id.toString();
  console.log(`Bot received command /start or /play from chatId: ${chatId}`);

  try {
    const response = await bot.sendMessage(chatId, "Welcome! Click 'Play' to start the game!", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Play',
              web_app: { url: `${vercelAppUrl}/?chatId=${chatId}` }  // Ensure chat ID is appended in the URL
            }
          ]
        ]
      }
    });
    console.log('Message sent:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
});
