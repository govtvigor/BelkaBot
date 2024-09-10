import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import { createInvoice } from './api/create-invoice'; 
import dotenv from 'dotenv';

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
const vercelAppUrl = 'https://belka-bot.vercel.app';  

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);
bot.setWebHook(`${vercelAppUrl}/bot${TELEGRAM_BOT_TOKEN}`);
console.log(`Telegram Bot Token: ${TELEGRAM_BOT_TOKEN}`);

const app = express();
app.use(express.json());

app.post(`/bot${TELEGRAM_BOT_TOKEN}`, (req, res) => {
  console.log('Incoming webhook request body:', JSON.stringify(req.body, null, 2));  // Log the request body
  try {
    bot.processUpdate(req.body);  // Process the update
    res.sendStatus(200);  // Respond with 200 OK
  } catch (error) {
    console.error('Error processing update:', error);  // Log any processing error
    res.sendStatus(500);  // Return error status if something goes wrong
  }
});

// Bot command handling (e.g., "/start" or "/play")
bot.onText(/\/play/, async (msg) => {
  const chatId = msg.chat.id.toString();
  console.log(`Bot received command /start or /play from chatId: ${chatId}`);

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
    console.log('Message sent successfully:', JSON.stringify(response));
  } catch (error) {
    console.error('Error sending message:', JSON.stringify(error));
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
