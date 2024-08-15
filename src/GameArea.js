import React, { useState, useEffect } from 'react';
import Squirrel from './Squirrel';
import Branch from './Branch';
import Score from './Score';
import Lives from './Lives';
import Timer from './Timer';

const GameArea = () => {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timer, setTimer] = useState(30); // Таймер начнется с 30 секунд
  const [position, setPosition] = useState('left'); // Белка стартует слева

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prevTimer => Math.max(prevTimer - 1, 0));
      if (timer === 0) {
        handleMiss();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleJump = (side) => {
    if (side === position) {
      // Неправильный клик — белка теряет жизнь
      handleMiss();
    } else {
      // Успешный прыжок — белка зарабатывает очко
      setScore(prevScore => prevScore + 1);
      setPosition(side);
      setTimer(prevTimer => Math.min(prevTimer + 5, 30)); // Пополнение таймера на 5 секунд
    }
  };

  const handleMiss = () => {
    setLives(prevLives => prevLives - 1);
    if (lives <= 1) {
      alert('Game Over!');
      resetGame();
    }
  };

  const resetGame = () => {
    setScore(0);
    setLives(3);
    setTimer(30);
    setPosition('left');
  };

  return (
    <div className="game-area">
      <Score score={score} />
      <Lives lives={lives} />
      <Timer timer={timer} />
      <div className="branches">
        <Branch side="left" onClick={() => handleJump('left')} />
        <Squirrel position={position} />
        <Branch side="right" onClick={() => handleJump('right')} />
      </div>
    </div>
  );
};

export default GameArea;
