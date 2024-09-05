import React, { useEffect, useState, createContext } from 'react';
import GameArea from './GameArea';
import './App.css';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

// Creating context for chatId
export const ChatIdContext = createContext<string | null>(null);

const App: React.FC = () => {
  const [chatId, setChatId] = useState<string | null>(null);

  useEffect(() => {
    // Parse the chatId from the URL query parameter
    const queryParams = new URLSearchParams(window.location.search);
    const chatIdFromUrl = queryParams.get('chatId');
    
    if (chatIdFromUrl) {
      setChatId(chatIdFromUrl);
      alert(`Chat ID received from URL: ${chatIdFromUrl}`);
    } else {
      console.error("Chat ID not found in URL.");
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
