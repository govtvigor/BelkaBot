import { VercelRequest, VercelResponse } from '@vercel/node';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const vercelAppUrl = `https://${req.headers.host}`; // Dynamically setting webhook based on request host
    console.log('Vercel App URL:', vercelAppUrl);

    // Set up webhook dynamically
    await bot.setWebHook(`${vercelAppUrl}/api/webhook`);
    console.log(`Webhook set to: ${vercelAppUrl}/api/webhook`);

    // Log incoming requests
    console.log('Incoming webhook request body:', JSON.stringify(req.body, null, 2));

    // Process the incoming update from Telegram
    bot.processUpdate(req.body);

    // Bot command handling inside the request
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

    // Respond with 200 OK to confirm receipt
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Error');
  }
};
