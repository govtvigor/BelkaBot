interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        openInvoice: (invoiceLink: string, callback: (status: string) => void) => void;
      };
    };
  }
  