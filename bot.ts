import TelegramBot, { Message, PreCheckoutQuery } from 'node-telegram-bot-api';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();


const app = express();
app.use(cors());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://myapp.vercel.app');  // Replace with your domain
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(bodyParser.json());


const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Маршрут для создания инвойса
app.post("/api/create-invoice", async (req: Request, res: Response) => {
  const { title, description, prices, chatId } = req.body;

  if (!chatId) {
    return res.status(400).json({ error: "Chat ID is missing" });
  }

  try {
    // Generate the invoice link
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
      // Return the invoice link
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

  
  

app.post('/api/validate-init-data', (req: Request, res: Response) => {
    const { initData } = req.body;
  
    
  
    // Парсим initData, если это строка (если оно пришло как строка, нужно парсить)
    const initParams = new URLSearchParams(initData);
    const userId = initParams.get('user_id');
  
    if (userId) {
      res.json({ chatId: userId });
    } else {
      res.status(400).json({ error: 'Invalid initData' });
    }
  });


app.get("/", (req: Request, res: Response) => {
  res.send("Server and Bot are running!");
});


const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Обработка получения сообщений для сохранения chatId
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
  


bot.on('message', (msg: Message) => {
  if (msg.successful_payment && msg.from) {
    const userId = msg.from.id;
    const paymentInfo = msg.successful_payment;

    console.log(`User ${userId} made a payment:`, paymentInfo);
    bot.sendMessage(userId, "✅ Payment accepted! You’ve purchased an extra life.");

    
  }
});


bot.on('pre_checkout_query', (query: PreCheckoutQuery) => {
  bot.answerPreCheckoutQuery(query.id, true).catch((error) => {
      console.error("Pre-checkout query error:", error);
  });
});
