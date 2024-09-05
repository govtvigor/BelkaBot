const express = require("express");
const bodyParser = require("body-parser");
const TelegramBot = require('node-telegram-bot-api');
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

app.post("/api/create-invoice", async (req, res) => {
  const { chatId, livesCost } = req.body; // Получаем chatId и стоимость жизней из тела запроса

  try {
    // Отправляем инвойс для оплаты в Telegram
    await bot.sendInvoice(
      chatId,
      "Extra Life",
      "Purchase an additional life for your game.",
      "{}",
      "", // Поставьте пустой токен провайдера для Telegram Stars
      "XTR", // Валюта
      [
        {
          label: "Extra Life",
          amount: livesCost * 10 // Сумма в минимальных единицах валюты (например, копейки)
        }
      ]
    );

    res.status(200).json({ message: "Invoice sent successfully" });
  } catch (error) {
    console.error("Error sending invoice:", error);
    res.status(500).json({ error: "Failed to send invoice" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Обработка успешного платежа
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
