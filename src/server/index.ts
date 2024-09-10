import { VercelRequest, VercelResponse } from '@vercel/node';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { createInvoice } from './api/create-invoice';
import { updateUserLives } from '../client/firebaseFunctions';

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
const vercelAppUrl = 'https://belka-bot.vercel.app';
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

let webhookSet = false;

export default async (req: VercelRequest, res: VercelResponse) => {
  if (!webhookSet) {
    await bot.setWebHook(`${vercelAppUrl}/api/webhook`);
    console.log(`Webhook set to: ${vercelAppUrl}/api/webhook`);
    webhookSet = true;
  }

  try {
    // Handle incoming updates from Telegram
    const message = req.body.message;

    // If the update contains a command like /play
    if (message && message.text) {
      const chatId = message.chat.id.toString();
      const command = message.text;

      // Separate the /play command handling
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
        return res.status(200).send('OK');
      }
    }

    // Payment handling logic: Separate it from the command handling
    if (req.body.pre_checkout_query) {
      const preCheckoutQuery = req.body.pre_checkout_query;
      console.log('Handling pre_checkout_query:', preCheckoutQuery);

      // Approve the pre-checkout query
      await bot.answerPreCheckoutQuery(preCheckoutQuery.id, true, { error_message: '' });
      console.log('Pre-checkout query approved.');
      return res.status(200).send('OK');
    }

    if (message && message.successful_payment) {
      const successfulPayment = message.successful_payment;
      const chatId = message.chat.id;
      console.log('Payment received:', successfulPayment);

      const newLives = 3;  // Example: give 3 lives
      await updateUserLives(chatId.toString(), newLives);

      bot.sendMessage(chatId, `Payment received! You now have ${newLives} extra lives.`);
      return res.status(200).send('OK');
    }

    return res.status(404).send('Not Found');
  } catch (error) {
    console.error('Error handling request:', error);
    return res.status(500).send('Error');
  }
};
