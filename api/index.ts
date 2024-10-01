// index.ts

import { VercelRequest, VercelResponse } from '@vercel/node';
import TelegramBot from 'node-telegram-bot-api';

import { updateUserLives, saveUserByChatId } from '../src/client/firebaseFunctions';



const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
const vercelAppUrl = 'https://belka-bot.vercel.app';
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
let webhookSet = false;

// Helper function to decode Base62 referral code
const decodeBase62 = (str: string): string => {
    const base62Chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let num = 0;
    for (let i = 0; i < str.length; i++) {
        const index = base62Chars.indexOf(str[i]);
        if (index === -1) throw new Error("Invalid character in referral code");
        num = num * 62 + index;
    }
    return num.toString();
};

export default async (req: VercelRequest, res: VercelResponse) => {
    if (!webhookSet) {
        try {
          await bot.setWebHook(`${vercelAppUrl}/api/webhook`);
          console.log(`Webhook set to: ${vercelAppUrl}/api/webhook`);
          webhookSet = true;
        } catch (error) {
          console.error("Error setting webhook:", error);
          return res.status(500).send('Error setting webhook');
        }
      }

    try {
        const body = req.body || {};
        const { message, callback_query, pre_checkout_query } = body;

        // Log the full request body for debugging
        console.log('Request Body:', JSON.stringify(body, null, 2));

        // Command handling logic for messages
        if (message && message.text) {
            const chatId = message.chat?.id?.toString();
            const command = message.text.trim();

            let referrerId: string | undefined = undefined;

            if (command.startsWith('/start')) {
                const parts = command.split(' ');
                if (parts.length > 1) {
                    const referralCode = parts[1];
                    try {
                        referrerId = decodeBase62(referralCode);
                        console.log(`Decoded referral code '${referralCode}' to referrerId '${referrerId}'`);
                    } catch (decodeError) {
                        console.error(`Error decoding referral code '${referralCode}':`, decodeError);
                        referrerId = undefined;
                    }
                }
            }

            if (command.startsWith('/start') || command === '/play') {
                console.log(`Received command '${command}' from chatId: ${chatId}, referrerId: ${referrerId}`);
                try {
                    const username = message.chat.username || '';
                    await saveUserByChatId(chatId, referrerId, username);
                    await saveUserByChatId(chatId, referrerId);
                    await bot.sendMessage(chatId, "Welcome! Click 'Play' to start the game!", {
                        reply_markup: {
                            inline_keyboard: [[{
                                text: 'Play',
                                web_app: { url: `${vercelAppUrl}/?chatId=${chatId}` }
                            }]]
                        },
                    });
                    return res.status(200).send('OK');
                } catch (error) {
                    console.error('Error sending message:', error);
                    return res.status(500).send('Error');
                }
            }
        }

        // Handle payment logic
        if (pre_checkout_query) {
            console.log('Handling pre_checkout_query:', pre_checkout_query);

            await bot.answerPreCheckoutQuery(pre_checkout_query.id, true, { error_message: '' });
            console.log('Pre-checkout query approved.');
            return res.status(200).send('OK');
        }

        if (message && message.successful_payment) {
            const successfulPayment = message.successful_payment;
            const chatId = message.chat.id.toString();

            console.log('Payment received:', successfulPayment);

            const userId = successfulPayment.invoice_payload.split('_')[1];

            const newLives = 3;
            try {
                await updateUserLives(userId, newLives);
                await bot.sendMessage(chatId, `Payment received! You now have ${newLives} extra lives.`);
            } catch (error) {
                console.error('Error updating user lives in Firebase:', error);
                await bot.sendMessage(chatId, 'Payment received, but there was an error updating your lives.');
            }

            return res.status(200).send('OK');
        }

        // If nothing is matched, return 404
        return res.status(404).send('Not Found');
    } catch (error) {
        console.error('Error handling request:', error);
        return res.status(500).send('Error');
    }
};
