import express from 'express';
import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import { createInvoice } from './api/create-invoice'; // Adjust path if needed

// Load environment variables from .env
dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
const vercelAppUrl = 'https://belka-bot.vercel.app';

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Create Express server
const app = express();
app.use(express.json());

// Bot command handling (e.g., "/start" or "/play")
bot.onText(/\/(start|play)/, async (msg) => {
  const chatId = msg.chat.id.toString();
  bot.sendMessage(chatId, "Welcome! Click 'Play' to start the game!", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Play',
            web_app: { url: `${vercelAppUrl}/?chatId=${chatId}` }
          }
        ]
      ]
    }
  });
});

// Invoice API endpoint
app.post('/api/create-invoice', async (req, res) => {
  const { chatId, title, description, amount } = req.body;

  try {
    const invoiceLink = await createInvoice(chatId, title, description, amount);
    res.json({ invoiceLink });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// Bot pre-checkout query handling
bot.on('pre_checkout_query', (query) => {
  bot.answerPreCheckoutQuery(query.id, true).catch((error) => {
    console.error("Pre-checkout query error:", error);
  });
});

// Start the Express server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
