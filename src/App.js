// import React, { useEffect } from 'react';

// function App() {
//   useEffect(() => {
//     if (window.Telegram.WebApp) {
//       const tg = window.Telegram.WebApp;
//       tg.ready();
//     }
//   }, []);

//   return (
//     <div className="App">
//       <h1>Welcome to Squirrel Game!</h1>
//       <p>This is a simple integration with Telegram Web Apps.</p>
//     </div>
//   );
// }

// export default App;

import React from 'react';
import GameArea from './GameArea';
import './App.css';

function App() {
  return (
    <div className="App">
      <GameArea />
    </div>
  );
}

export default App;

