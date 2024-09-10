import { VercelRequest, VercelResponse } from '@vercel/node';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { createInvoice } from './api/create-invoice';

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
const vercelAppUrl = 'https://belka-bot.vercel.app';
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

let webhookSet = false;

export default async (req: VercelRequest, res: VercelResponse) => {
  // Set the webhook once
  if (!webhookSet) {
    await bot.setWebHook(`${vercelAppUrl}/api/webhook`);
    console.log(`Webhook set to: ${vercelAppUrl}/api/webhook`);
    webhookSet = true;
  }

  try {
    if (req.url?.includes('/api/webhook')) {
      console.log('Incoming webhook request body:', JSON.stringify(req.body, null, 2));
      bot.processUpdate(req.body);  // Process the update from Telegram

      // Directly extracting the command
      const message = req.body.message;
      if (message && message.text) {
        const chatId = message.chat.id.toString();
        const command = message.text;
        
        // Handle /start and /play commands directly
        if (command === '/start' || command === '/play') {
          console.log(`Received command from chatId: ${chatId}`);

          try {
            const response = await bot.sendMessage(chatId, "Welcome! Click 'Play' to start the game!", {
              reply_markup: {
                inline_keyboard: [[{
                  text: 'Play',
                  web_app: { url: `${vercelAppUrl}/?chatId=${chatId}` }
                }]]
              },
            });
            console.log('Message sent:', response);
          } catch (error) {
            console.error('Error sending message:', error);
          }
        }
      }

      return res.status(200).send('OK');
    }

    // Invoice endpoint (if this exists in your bot)
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

    // Return 404 if no endpoint matches
    return res.status(404).send('Not Found');
  } catch (error) {
    console.error('Error handling request:', error);
    return res.status(500).send('Error');
  }
};
