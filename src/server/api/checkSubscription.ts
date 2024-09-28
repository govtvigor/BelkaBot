// checkSubscription.ts

import { VercelRequest, VercelResponse } from '@vercel/node';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
const TELEGRAM_CHANNEL_USERNAME = process.env.TELEGRAM_CHANNEL_USERNAME as string; // e.g., 'YourChannelName'

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { chatId } = req.body;

  if (!chatId) {
    res.status(400).json({ error: 'Missing chatId' });
    return;
  }

  try {
    // Get chat member status
    const member = await bot.getChatMember(`@${TELEGRAM_CHANNEL_USERNAME}`, chatId);

    if (member.status === 'member' || member.status === 'administrator' || member.status === 'creator') {
      res.status(200).json({ isMember: true });
    } else {
      res.status(200).json({ isMember: false });
    }
  } catch (error: any) {
    console.error('Error checking subscription:', error.message);

    // Handle specific error if user not found or bot not admin
    if (error.response && error.response.status === 403) {
      res.status(500).json({ error: 'Bot is not an admin of the channel or cannot access member information.' });
    } else if (error.response && error.response.status === 400) {
      res.status(400).json({ error: 'Bad Request. Possibly invalid chatId.' });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};
