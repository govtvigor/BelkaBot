// src/client/App.tsx

import React, { useEffect, useState, createContext } from 'react';
import GameArea from './GameArea';
import './App.css';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { useTranslation } from 'react-i18next';
import i18n from './i18n'; // Import i18n configuration
import { getUserLanguage } from './firebaseFunctions'; // Import function to fetch user's language

export const ChatIdContext = createContext<string | null>(null);

const App: React.FC = () => {
  const [chatId, setChatId] = useState<string | null>(null);
  const { t } = useTranslation(); // Get the translation function

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const chatIdFromUrl = queryParams.get('chatId');

    if (chatIdFromUrl) {
      setChatId(chatIdFromUrl);

      // Fetch the user's language from Firebase using the chatId
      getUserLanguage(chatIdFromUrl)
        .then((languageCode) => {
          if (languageCode && languageCode !== i18n.language) {
            i18n.changeLanguage(languageCode); // Change the language dynamically
          }
        })
        .catch((error) => {
          console.error('Error fetching user language from Firebase:', error);
        });
    }
  }, []);

  return (
    <TonConnectUIProvider manifestUrl="https://belka-bot.vercel.app/tonconnect-manifest.json">
      <ChatIdContext.Provider value={chatId}>
        <div className="App">
          <h1>{t('welcome')}</h1> {/* Translation for welcome message */}
          <GameArea />
        </div>
      </ChatIdContext.Provider>
    </TonConnectUIProvider>
  );
};

export default App;
