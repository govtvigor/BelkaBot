import React, { useEffect, useState, createContext } from 'react';
import GameArea from './GameArea';
import './App.css';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

// Create context for chatId
export const ChatIdContext = createContext<string | null>(null);

const App: React.FC = () => {
  const [chatId, setChatId] = useState<string | null>(null);

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
          <h1>Chat ID: {chatId}</h1> {/* Display the chatId for debugging */}
          <GameArea />
        </div>
      </ChatIdContext.Provider>
    </TonConnectUIProvider>
  );
};

export default App;
