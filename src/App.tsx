// src/App.tsx

import React, { useEffect } from 'react';
import GameArea from './GameArea';
import './App.css';
import { TonConnectUIProvider } from '@tonconnect/ui-react';


const App: React.FC = () => {
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      // Вы можете добавить здесь другие взаимодействия с Telegram WebApp API
    }
  }, []);

  return (
    <TonConnectUIProvider manifestUrl="https://belka-bot-igors-projects-2a126fbf.vercel.app/tonconnect-manifest.json">
      <div className="App">
        <GameArea />
      </div>
    </TonConnectUIProvider>
  );
};

export default App;
