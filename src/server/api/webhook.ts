import { Request, Response } from 'express';
import bot from '../bot-setup';

export const handleWebhook = (req: Request, res: Response) => {
  if (req.body) {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
};
