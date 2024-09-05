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

// Маршрут для создания инвойса
app.post("/api/create-invoice", async (req: Request, res: Response) => {
  const { chatId, livesCost } = req.body;

  if (!chatId) {
    console.error("Chat ID is missing in the request body.");
    return res.status(400).json({ error: "Chat ID is missing" });
  }

  try {
    // Отправка инвойса пользователю через Telegram Stars
    await bot.sendInvoice(
      chatId,
      "Extra Life",
      "Purchase an additional life for your game.",
      "UniquePayloadIdentifier", // Уникальный идентификатор инвойса
      "", // Telegram Stars Token (должен быть указан)
      "XTR", // Валюта
      [
        {
          label: "Extra Life",
          amount: livesCost * 100 // Сумма в минимальных единицах (например, копейках)
        }
      ]
    );

    res.status(200).json({ message: "Invoice sent successfully" });
  } catch (error) {
    console.error("Error sending invoice:", error);
    res.status(500).json({ error: "Failed to send invoice" });
  }
});
app.get('/api/get-user', (req, res) => {
    // Используйте здесь идентификацию пользователя через API Telegram
    const chatId = "123456"; // Замените на фактическое получение chat_id через ваш бот
    res.json({ chat_id: chatId });
  });
app.post('/api/validate-init-data', (req: Request, res: Response) => {
    const { initData } = req.body;
  
    // Тут можно добавить логику валидации initData
  
    // Парсим initData, если это строка (если оно пришло как строка, нужно парсить)
    const initParams = new URLSearchParams(initData);
    const userId = initParams.get('user_id');
  
    if (userId) {
      res.json({ chatId: userId });
    } else {
      res.status(400).json({ error: 'Invalid initData' });
    }
  });

// Маршрут для проверки работы сервера
app.get("/", (req: Request, res: Response) => {
  res.send("Server and Bot are running!");
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Обработка получения сообщений для сохранения chatId
bot.onText(/\/(start|play)/, async (msg: Message) => {
    const chatId = msg.chat.id.toString();
    console.log(`Start/Play command received for chatId: ${chatId}`);
  
    // Send the chat ID as a query parameter in the web app URL
    bot.sendMessage(chatId, "Welcome! Click 'Play' to start the game!", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Play',
              web_app: { url: `https://belka-bot.vercel.app/?chatId=${chatId}` } // Ensure chat ID is sent in URL
            }
          ]
        ]
      }
    });
  });
  

// Обработка успешных платежей
bot.on('message', (msg: Message) => {
  if (msg.successful_payment && msg.from) {
    const userId = msg.from.id;
    const paymentInfo = msg.successful_payment;

    console.log(`User ${userId} made a payment:`, paymentInfo);
    bot.sendMessage(userId, "✅ Payment accepted! You’ve purchased an extra life.");
  }
});

// Обработка pre-checkout запросов
bot.on('pre_checkout_query', (query: PreCheckoutQuery) => {
  bot.answerPreCheckoutQuery(query.id, true).catch((error) => {
    console.error("Pre-checkout query error:", error);
  });
});
