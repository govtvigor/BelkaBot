// api/getReferralLink.ts (API route)
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (req: VercelRequest, res: VercelResponse) => {
  const userChatId = req.query.userChatId;

  if (!userChatId) {
    return res.status(400).json({ error: 'Missing userChatId' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN; // Safe on server-side
  if (!botToken) {
    return res.status(500).json({ error: 'Bot token not found' });
  }

  const referralLink = `https://t.me/${botToken}?start=${userChatId}`;
  return res.status(200).json({ referralLink });
};
