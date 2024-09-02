// src/global.d.ts

interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        // Добавьте сюда другие методы и свойства Telegram WebApp API, которые вы используете
      };
    };
  }
  