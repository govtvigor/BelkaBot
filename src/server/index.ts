import { VercelRequest, VercelResponse } from '@vercel/node';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { createInvoice } from './api/create-invoice';

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
const vercelAppUrl = 'https://belka-bot.vercel.app';
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

// Set the webhook ONCE during initialization
bot.setWebHook(`${vercelAppUrl}/api/webhook`);
console.log(`Webhook set to: ${vercelAppUrl}/api/webhook`);

// Bot command handling (registered once globally)
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

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (req.url?.includes('/api/webhook')) {
      console.log('Incoming webhook request body:', JSON.stringify(req.body, null, 2));
      bot.processUpdate(req.body);  // Process the incoming update from Telegram
      return res.status(200).send('OK');
    }

    if (req.url?.includes('/api/create-invoice')) {
      const { chatId, title, description, amount } = req.body;
      try {
        const invoiceLink = await createInvoice(chatId, title, description, amount);
        return res.status(200).json({ invoiceLink });
      } catch (error) {
        console.error('Invoice creation error:', error);
        return res.status(500).json({ error: 'Invoice creation failed' });
      }
    }

    return res.status(404).send('Not Found');
  } catch (error) {
    console.error('Error handling request:', error);
    return res.status(500).send('Error');
  }
};
