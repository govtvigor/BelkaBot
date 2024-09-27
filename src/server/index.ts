import { VercelRequest, VercelResponse } from '@vercel/node';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { updateUserLives, saveUserByChatId } from '../client/firebaseFunctions';

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
const vercelAppUrl = 'https://belka-bot.vercel.app';
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

// Set the webhook to the Vercel URL
bot.setWebHook(`${vercelAppUrl}/api/index`);

export default async (req: VercelRequest, res: VercelResponse) => {
    try {
        const { message, callback_query } = req.body;

        // Log the incoming update for debugging
        console.log(`Received update: ${JSON.stringify(req.body)}`);

        // Command handling logic
        if (message && message.text) {
            const chatId = message.chat.id.toString();
            const command = message.text.trim();

            // Extract referrerId from /start command if present
            let referrerId: string | undefined = undefined;
            if (command.startsWith('/start')) {
                const parts = command.split(' ');
                if (parts.length > 1) {
                    referrerId = parts[1];
                }
            }

            // Handle the /start or /play command to show a welcome message and Play button
            if (command.startsWith('/start') || command.startsWith('/play')) {
                console.log(`Received command from chatId: ${chatId}, referrerId: ${referrerId}, command: ${command}`);
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
                    return res.status(500).send('Error');
                }
            }
        }

        // Payment handling logic
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
            const chatId = message.chat.id.toString();

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
