import { VercelRequest, VercelResponse } from '@vercel/node';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { createInvoice } from './api/create-invoice'; // Assuming the path is correct

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
const vercelAppUrl = process.env.VERCEL_URL;
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);
bot.setWebHook(`${vercelAppUrl}/api/webhook`);

export default async (req: VercelRequest, res: VercelResponse) => {
   // Dynamically setting webhook based on request host

  try {
    // Set the webhook dynamically (only set it once if not already set)
    
    console.log(`Webhook set to: ${vercelAppUrl}/api/webhook`);

    // If it's a POST request to '/api/create-invoice'
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

    // Handle webhook from Telegram
    if (req.url?.includes('/api/webhook')) {
      console.log('Incoming webhook request body:', JSON.stringify(req.body, null, 2));
      bot.processUpdate(req.body);  // Process the incoming update from Telegram

      // Bot command handling
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

      // Respond with 200 OK to confirm receipt of the update
      return res.status(200).send('OK');
    }

    // Return 404 if no endpoint matches
    return res.status(404).send('Not Found');
  } catch (error) {
    console.error('Error handling webhook:', error);
    return res.status(500).send('Error');
  }
};



