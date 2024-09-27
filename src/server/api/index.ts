// index.ts

import { VercelRequest, VercelResponse } from '@vercel/node';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { updateUserLives, saveUserByChatId } from '../../client/firebaseFunctions';

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
        const { message, callback_query } = req.body;

        if (message && message.text) {
            const chatId = message.chat.id.toString();
            const command = message.text;

            let referrerId: string | undefined = undefined;
            if (command.startsWith('/start')) {
                const parts = command.split(' ');
                if (parts.length > 1) {
                    referrerId = parts[1];
                }
            }

            if (command.startsWith('/start') || command === '/play') {
                console.log(`Received command from chatId: ${chatId}, referrerId: ${referrerId}`);
                try {
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
                }
            }
        }

        if (req.body.pre_checkout_query) {
            const preCheckoutQuery = req.body.pre_checkout_query;
            console.log('Handling pre_checkout_query:', preCheckoutQuery);

            await bot.answerPreCheckoutQuery(preCheckoutQuery.id, true, { error_message: '' });
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

        return res.status(404).send('Not Found');
    } catch (error) {
        console.error('Error handling request:', error);
        return res.status(500).send('Error');
    }
};