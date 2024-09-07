// src/global.d.ts

interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        openInvoice: (invoiceLink: string, callback: (status: string) => void) => void;
        // Добавьте сюда другие методы и свойства Telegram WebApp API, которые вы используете

      };
    };
  }
  