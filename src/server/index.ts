import { VercelRequest, VercelResponse } from '@vercel/node';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
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
        const { message } = req.body;

        // Command handling logic
        if (message && message.text) {
            const chatId = message.chat.id.toString();
            const command = message.text;

            // Handle the /start or /play command to show a welcome message and Play button
            if (command === '/start' || command === '/play') {
                console.log(`Received command from chatId: ${chatId}`);
                try {
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

        // Payment handling logic: 
        if (req.body.pre_checkout_query) {
            const preCheckoutQuery = req.body.pre_checkout_query;
            console.log('Handling pre_checkout_query:', preCheckoutQuery);

            // Approve the pre-checkout query.
            await bot.answerPreCheckoutQuery(preCheckoutQuery.id, true, { error_message: '' });
            console.log('Pre-checkout query approved.');
            return res.status(200).send('OK');
        }

        // Handle successful payment from the profile button. 
        if (message && message.successful_payment) {
            const successfulPayment = message.successful_payment;
            const chatId = message.chat.id;

            console.log('Payment received:', successfulPayment);

            // Extract user ID from the invoice_payload
            const userId = successfulPayment.invoice_payload.split('_')[1]; // Expecting 'invoice_userId_...'

            const newLives = 3; // Define lives to be added
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