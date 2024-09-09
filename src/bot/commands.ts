import bot, {vercelAppUrl} from './bot-setup';

bot.onText(/\/(start|play)/, async (msg) => {
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

bot.on('pre_checkout_query', (query) => {
  bot.answerPreCheckoutQuery(query.id, true).catch((error) => {
    console.error("Pre-checkout query error:", error);
  });
});
