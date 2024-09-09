import { Request, Response } from 'express';
import fetch from 'node-fetch';
import { TELEGRAM_BOT_TOKEN, vercelAppUrl } from '../bot/bot-setup';

export const setWebhook = async (req: Request, res: Response) => {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook?url=${vercelAppUrl}/bot${TELEGRAM_BOT_TOKEN}`);
    const data = await response.json();
    console.log(data);
    res.send(data);
  } catch (error) {
    console.error("Error setting webhook:", error);
    res.status(500).send("Webhook setup failed");
  }
};
