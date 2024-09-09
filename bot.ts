import TelegramBot, { Message, PreCheckoutQuery } from 'node-telegram-bot-api';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
const vercelAppUrl = 'https://belka-bot.vercel.app';

// Set the webhook
bot.setWebHook(`${vercelAppUrl}/bot${TELEGRAM_BOT_TOKEN}`);

// Define the expected structure of the response from the createInvoiceLink API
interface CreateInvoiceResponse {
    ok: boolean;
    result?: string; // Add other properties if needed
    description?: string;
}

// Route for creating invoices
app.post("/api/create-invoice", async (req: Request, res: Response) => {
    const { title, description, prices, chatId } = req.body;

    if (!chatId) {
        return res.status(400).json({ error: "Chat ID is missing" });
    }

    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/createInvoiceLink`;
        const requestBody = {
            title,
            description,
            payload: `invoice_${chatId}_${Date.now()}`,
            currency: "XTR",
            prices,
        };

        const response = await fetch(url, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json() as CreateInvoiceResponse; // Use type assertion

        if (data.ok) {
            res.status(200).json({ invoiceLink: data.result });
        } else {
            res.status(500).json({ error: data.description });
        }
    } catch (error) {
        console.error("Error creating invoice:", error);
        res.status(500).json({ error: "Failed to create invoice" });
    }
});

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
    res.send("Server and Bot are running!");
});

// Start server
const PORT = process.env.PORT || 5001; // Use the port from environment or default to 5001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Handling start and play commands
bot.onText(/\/(start|play)/, async (msg: Message) => {
    const chatId = msg.chat.id.toString();
    bot.sendMessage(chatId, "Welcome! Click 'Play' to start the game!", {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Play',
                        web_app: { url: `${vercelAppUrl}/?chatId=${chatId}` }
                    }
                ]
            ]
        }
    });
});

// Handling pre-checkout queries
bot.on('pre_checkout_query', (query: PreCheckoutQuery) => {
    bot.answerPreCheckoutQuery(query.id, true).catch((error) => {
        console.error("Pre-checkout query error:", error);
    });
});

// Handling incoming webhook updates
app.post(`/bot${TELEGRAM_BOT_TOKEN}`, (req: Request, res: Response) => {
    console.log("Webhook received:", req.body);
    if (req.body) {
      bot.processUpdate(req.body);
      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
  });

app.get("/setWebhook", async (req: Request, res: Response) => {
    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook?url=${vercelAppUrl}/bot${TELEGRAM_BOT_TOKEN}`);
      const data = await response.json();
      console.log(data);
      res.send(data);
    } catch (error) {
      console.error("Error setting webhook:", error);
      res.status(500).send("Webhook setup failed");
    }
  });
  

// Optionally function to set the webhook (can be run once to reset the webhook)
async function setWebhook() {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook?url=${vercelAppUrl}/bot${TELEGRAM_BOT_TOKEN}`);
    const data = await response.json();
    console.log(data);
}

// Uncomment to set the webhook on startup
setWebhook();
