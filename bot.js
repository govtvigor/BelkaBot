const TelegramBot = require('node-telegram-bot-api');
const token = '6337298860:AAEx-0D01b9wdtuw8xXqhk4ih1xA_0OwwUE';
const bot = new TelegramBot(token, { polling: true });

// Обработка команды /start или /play
bot.onText(/\/(start|play)/, (msg) => {
  const chatId = msg.chat.id;
  const gameUrl = 'https://belka-bot.vercel.app/'; // URL вашего развернутого приложения

  // Отправляем сообщение с кнопкой для открытия веб-приложения
  bot.sendMessage(chatId, "Click 'Play' to start the game!", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Play',
            web_app: { url: gameUrl }
          }
        ]
      ]
    }
  });
});
