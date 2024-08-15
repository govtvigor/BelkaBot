import React, { useEffect } from 'react';
import GameArea from './GameArea';
import './App.css';

function App() {
  useEffect(() => {
    if (window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      // Вы можете добавить здесь другие взаимодействия с Telegram WebApp API
    }
  }, []);

  return (
    <div className="App">
      <GameArea />
    </div>
  );
}

export default App;
