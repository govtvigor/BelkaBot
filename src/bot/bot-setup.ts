import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
export const vercelAppUrl = 'https://belka-bot.vercel.app';

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

export default bot;
