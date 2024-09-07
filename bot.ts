import TelegramBot, { Message, PreCheckoutQuery } from 'node-telegram-bot-api';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();


const app = express();
app.use(cors());
app.use(bodyParser.json());


const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
const herokuAppUrl = 'https://nut-game-73716189031b.herokuapp.com';

bot.setWebHook(`${herokuAppUrl}/bot${TELEGRAM_BOT_TOKEN}`);

// Маршрут для создания инвойса
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
      prices
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    if (data.ok) {
      
      res.status(200).json({ invoiceLink: data.result });
    } else {
      res.status(500).json({ error: data.description });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to create invoice" });
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send("Server and Bot are running!");
});

  
  



const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


bot.onText(/\/(start|play)/, async (msg: Message) => {
    const chatId = msg.chat.id.toString();
    bot.sendMessage(chatId, "Welcome! Click 'Play' to start the game!", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Play',
              web_app: { url: `https://belka-bot.vercel.app/?chatId=${chatId}` }  // Ensure chat ID is appended in URL
            }
          ]
        ]
      }
    });
});
  





bot.on('pre_checkout_query', (query: PreCheckoutQuery) => {
  bot.answerPreCheckoutQuery(query.id, true).catch((error) => {
      console.error("Pre-checkout query error:", error);
  });
});
