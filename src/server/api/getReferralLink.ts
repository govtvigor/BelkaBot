// api/getReferralLink.ts

import { VercelRequest, VercelResponse } from '@vercel/node';

const getReferralLink = (userChatId: string): string => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error('Telegram bot token not found');
  }
  return `https://t.me/${botToken}?start=${userChatId}`;
};

export default async (req: VercelRequest, res: VercelResponse) => {
  const { userChatId } = req.query;

  if (!userChatId || typeof userChatId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid userChatId' });
  }

  try {
    const referralLink = getReferralLink(userChatId);
    return res.status(200).json({ referralLink });
  } catch (error: any) {
    console.error('Error generating referral link:', error);
    return res.status(500).json({ error: error.message });
  }
};