// src/client/App.tsx

import React, { useEffect, useState, createContext } from 'react';
import GameArea from './GameArea';
import './App.css';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { useTranslation } from 'react-i18next'; // Import useTranslation hook
import './i18n'; // Ensure the i18n configuration is imported

export const ChatIdContext = createContext<string | null>(null);

const App: React.FC = () => {
  const [chatId, setChatId] = useState<string | null>(null);
  const { t } = useTranslation(); // Initialize translation

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const chatIdFromUrl = queryParams.get('chatId');

    if (chatIdFromUrl) {
      setChatId(chatIdFromUrl);
    }
  }, []);

  return (
    <TonConnectUIProvider manifestUrl="https://belka-bot.vercel.app/tonconnect-manifest.json">
      <ChatIdContext.Provider value={chatId}>
        <div className="App">
          
          <GameArea />
        </div>
      </ChatIdContext.Provider>
    </TonConnectUIProvider>
  );
};

export default App;
