const express = require("express");
const bodyParser = require("body-parser");
const TelegramBot = require('node-telegram-bot-api');
require("dotenv").config();

// Инициализация Express
const app = express();
app.use(bodyParser.json());

// Инициализация бота Telegram
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// API маршрут для создания инвойса
app.post("/api/create-invoice", async (req, res) => {
  const { chatId, livesCost } = req.body;

  try {
    // Отправка инвойса пользователю
    await bot.sendInvoice(
      chatId,
      "Extra Life",
      "Purchase an additional life for your game.",
      "{}",
      "", // Оставьте пустым для Telegram Stars
      "XTR", // Валюта
      [
        {
          label: "Extra Life",
          amount: livesCost * 10 // Сумма в минимальных единицах валюты (например, копейках)
        }
      ]
    );

    res.status(200).json({ message: "Invoice sent successfully" });
  } catch (error) {
    console.error("Error sending invoice:", error);
    res.status(500).json({ error: "Failed to send invoice" });
  }
});

// Маршрут для проверки работы сервера
app.get("/", (req, res) => {
  res.send("Server and Bot are running!");
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Логика обработки сообщений и платежей бота Telegram
bot.onText(/\/(start|play)/, (msg) => {
  const chatId = msg.chat.id;
  const gameUrl = 'https://belka-bot.vercel.app/'; // URL вашей игры

  // Отправка сообщения с кнопкой для открытия веб-приложения
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

bot.onText(/\/pay/, (msg) => {
  const chatId = msg.chat.id;

  // Отправка инвойса для оплаты
  bot.sendInvoice(
    chatId,
    "Extra Life",
    "Purchase an additional life for your game.",
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

// Обработка успешных платежей
bot.on('message', (msg) => {
  if (msg.successful_payment) {
    const paymentInfo = msg.successful_payment;
    const userId = msg.from.id;

    console.log(`User ${userId} made a payment:`, paymentInfo);
    bot.sendMessage(userId, "✅ Payment accepted! You’ve purchased an extra life.");
  }
});

// Обработка pre-checkout запросов
bot.on('pre_checkout_query', (query) => {
  bot.answerPreCheckoutQuery(query.id, true).catch((error) => {
    console.error("Pre-checkout query error:", error);
  });
});
