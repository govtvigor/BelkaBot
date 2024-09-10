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
    if (req.url?.includes('/api/webhook')) {
      console.log('Incoming webhook request body:', JSON.stringify(req.body, null, 2));
      bot.processUpdate(req.body);

      // Handle pre-checkout query
      if (req.body.pre_checkout_query) {
        const preCheckoutQuery = req.body.pre_checkout_query;
        console.log('Handling pre_checkout_query:', preCheckoutQuery);
        
        // Approve the pre-checkout query
        bot.answerPreCheckoutQuery(preCheckoutQuery.id, true, { error_message: '' }).then(() => {
          console.log('Pre-checkout query approved.');
        }).catch((err) => {
          console.error('Error approving pre-checkout query:', err);
        });
      }

      // Handle successful payment
      if (req.body.message && req.body.message.successful_payment) {
        const successfulPayment = req.body.message.successful_payment;
        const chatId = req.body.message.chat.id;
        console.log('Payment received:', successfulPayment);

        // Process the payment (update user lives, etc.)
        const newLives = 3;  // Example: give 3 lives
        await updateUserLives(chatId, newLives);  // Assuming this function exists

        bot.sendMessage(chatId, `Payment received! You now have ${newLives} extra lives.`);
      }

      // Handle regular commands (like /start or /play)
      const message = req.body.message;
      if (message && message.text) {
        const chatId = message.chat.id.toString();
        const command = message.text;
        
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

    // Handle invoice creation
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
