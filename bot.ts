const TelegramBot = require('node-telegram-bot-api');

// Token for your bot
const token = '6337298860:AAEx-0D01b9wdtuw8xXqhk4ih1xA_0OwwUE'; // Replace with your actual token 
const bot = new TelegramBot(token, { polling: true });

// Game URL
const gameUrl = 'https://belka-bot.vercel.app/'; // URL of your deployed application

// Handle the /start and /play commands
bot.onText(/\/(start|play)/, (msg) => {
    const chatId = msg.chat.id;

    // Send a message with a button to open the web app
    bot.sendMessage(chatId, "Click 'Play' to start the game!", {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: 'Play',
                    web_app: { url: gameUrl }
                }]
            ]
        }
    });
});

// Handle the /pay command for payments
bot.onText(/\/pay/, (msg) => {
    const chatId = msg.chat.id;

    // Send an invoice for payment (here using Telegram Stars)
    bot.sendInvoice(chatId, "Extra Life", "Purchase an additional life for your game.",
        "{}",
        "", // Provider token must be empty for Telegram Stars
        "XTR", // Currency
        [{
            label: "Extra Life",
            amount: 10 * 10 // Amount in smallest unit
        }]
    ).catch((error) => {
        console.error("Error sending invoice:", error);
    });
});

// Handle successful payment
bot.on('message', (msg) => {
    if (msg.successful_payment) {
        // Handle successful payment here
        const paymentInfo = msg.successful_payment;
        const userId = msg.from.id;

        // For demonstration, you can log payment details or save them to a database
        console.log(`User ${userId} made a payment:`, paymentInfo);
        bot.sendMessage(userId, "✅ Payment accepted! You’ve purchased an extra life.");
    }
});

// Handle pre-checkout queries
bot.on('pre_checkout_query', (query) => {
    bot.answerPreCheckoutQuery(query.id, true).catch((error) => {
        console.error("Pre-checkout query error:", error);
    });
});
