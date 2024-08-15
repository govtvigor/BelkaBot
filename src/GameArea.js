import React, { useState, useEffect } from 'react';
import Squirrel from './Squirrel';
import Branch from './Branch';
import Score from './Score';
import Lives from './Lives';
import Timer from './Timer';
import treeImage from './assets/tree.png'; // Импорт дерева

const GameArea = () => {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timer, setTimer] = useState(30);
  const [position, setPosition] = useState('center'); // Начальная позиция белки по центру
  const [branches, setBranches] = useState([]); // Список веток

  useEffect(() => {
    // Появление первой ветки
    addNewBranch();
  }, []);

  const addNewBranch = () => {
    const side = Math.random() > 0.5 ? 'left' : 'right';
    setBranches(prevBranches => [...prevBranches, { side }]);
  };

  const handleJump = (side) => {
    if (side === position) {
      handleMiss();
    } else {
      setScore(prevScore => prevScore + 1);
      setPosition(side);
      setTimer(prevTimer => Math.min(prevTimer + 5, 30));
      addNewBranch(); // Добавляем новую ветку после прыжка
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
    setPosition('center');
    setBranches([]);
    addNewBranch();
  };

  return (
    <div className="game-area">
      <img src={treeImage} alt="Tree" className="tree" />
      <Score score={score} />
      <Lives lives={lives} />
      <Timer timer={timer} />
      <div className="branches">
        {branches.map((branch, index) => (
          <Branch key={index} side={branch.side} onClick={() => handleJump(branch.side)} />
        ))}
        <Squirrel position={position} />
      </div>
    </div>
  );
};

export default GameArea;
