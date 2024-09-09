import express from 'express';

import TelegramBot from 'node-telegram-bot-api';
import { createInvoice } from './api/create-invoice'; 


// Load environment variables from .env


const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
const vercelAppUrl = 'https://belka-bot.vercel.app';  // Adjust this with your actual Vercel domain

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);
console.log(`Telegram Bot Token: ${TELEGRAM_BOT_TOKEN}`);

// Set up webhook
bot.setWebHook(`${vercelAppUrl}/bot${TELEGRAM_BOT_TOKEN}`);

const app = express();
app.use(express.json());

app.post(`/bot${TELEGRAM_BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Bot command handling (e.g., "/start" or "/play")
bot.onText(/\/(start|play)/, async (msg) => {
  const chatId = msg.chat.id.toString();
  console.log('Bot received command /start or /play');
  
  try {
    const response = await bot.sendMessage(chatId, "Welcome! Click 'Play' to start the game!", {
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
    console.log('Message sent:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
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

// Start the Express server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
