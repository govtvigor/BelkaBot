import React, { useState, useEffect } from 'react';
import Squirrel from './Squirrel';
import Branch from './Branch';
import Score from './Score';
import Lives from './Lives';
import treeImage from './assets/tree.png';

const GameArea = () => {
  const [branches, setBranches] = useState([]);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [squirrelSide, setSquirrelSide] = useState('right');
  const [squirrelTop, setSquirrelTop] = useState(500);
  const [points, setPoints] = useState(0);
  const [lives, setLives] = useState(3);
  const [speed, setSpeed] = useState(5);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const initialBranches = [
      { side: 'left', top: 400 },
      { side: 'right', top: 100 },
    ];
    setBranches(initialBranches);
  }, []);

  useEffect(() => {
    if (gameStarted) {
      const interval = setInterval(() => {
        setScrollOffset(prevOffset => prevOffset + speed);
  
        // Удаление веток, которые вышли за экран
        setBranches(prevBranches => prevBranches.filter(branch => branch.top + scrollOffset < window.innerHeight));
  
        // Добавление новой ветки, когда последняя ветка поднялась достаточно высоко
        const lastBranch = branches[branches.length - 1];
        if (lastBranch && lastBranch.top + scrollOffset < window.innerHeight - 200) {  // Уменьшили интервал для более частого появления веток
          const newBranchSide = Math.random() > 0.5 ? 'left' : 'right';
          const newBranchTop = lastBranch.top - 250; // Чуть уменьшили интервал между ветками
          setBranches(prevBranches => [
            ...prevBranches,
            { side: newBranchSide, top: newBranchTop },
          ]);
        }
  
        // Потеря жизни, если ветка исчезла и белка не прыгнула
        const nextBranch = branches[0];
        if (nextBranch && nextBranch.top + scrollOffset > squirrelTop + 45 && nextBranch.side === squirrelSide) {
          setLives(prevLives => prevLives - 1);
          if (lives <= 1) {
            alert('Game over! No more lives left.');
            setGameStarted(false); // Останавливаем игру
            setLives(3); // Сбрасываем жизни для новой игры
            setPoints(0); // Сбрасываем очки
            setSpeed(5); // Сбрасываем скорость
            setScrollOffset(0); // Сбрасываем прокрутку
            return;
          }
        }
  
      }, 50);
  
      return () => clearInterval(interval);
    }
  }, [scrollOffset, branches, speed, gameStarted, lives, squirrelSide, squirrelTop]);
  

  const handleBranchClick = (side, top) => {
    if (!gameStarted) {
      setGameStarted(true);
      return; // Первый клик только запускает игру, жизнь не теряется
    }

    const nextBranch = branches[0];

    if (nextBranch && side === nextBranch.side && top + scrollOffset === nextBranch.top + scrollOffset) {
      setPoints(prevPoints => prevPoints + 1);
      setSpeed(prevSpeed => prevSpeed + 0.5);
      setSquirrelSide(side);
      setSquirrelTop(top + scrollOffset - 45); // Это свойство отвечает за позицию белки при прыжке
      setBranches(prevBranches => prevBranches.slice(1)); // Удаление предыдущей ветки
    } else {
      setLives(prevLives => prevLives - 1); // Уменьшаем жизнь, если клик на неправильную ветку
      if (lives <= 1) {
        alert('Game over! No more lives left.');
        setGameStarted(false); // Останавливаем игру
        setLives(3); // Сбрасываем жизни для новой игры
        setPoints(0); // Сбрасываем очки
        setSpeed(5); // Сбрасываем скорость
        setScrollOffset(0); // Сбрасываем прокрутку
        return;
      }
    }
  };

  return (
    <div className="game-area">
      <div className="tree-wrapper">
        <img
          src={treeImage}
          alt="Tree"
          className="tree-image"
          style={{ transform: `translateY(${scrollOffset % window.innerHeight}px)` }}
        />
        <img
          src={treeImage}
          alt="Tree"
          className="tree-image"
          style={{ transform: `translateY(${(scrollOffset % window.innerHeight) - window.innerHeight}px)` }}
        />
        <img
          src={treeImage}
          alt="Tree"
          className="tree-image"
          style={{ transform: `translateY(${(scrollOffset % window.innerHeight) - window.innerHeight * 2}px)` }}
        />
        <img
          src={treeImage}
          alt="Tree"
          className="tree-image"
          style={{ transform: `translateY(${(scrollOffset % window.innerHeight) - window.innerHeight * 3}px)` }}
        />
      </div>
      <Lives lives={lives} />
      <Score points={points} />
      <div className="branches">
        {branches.map((branch, index) => (
          <Branch
            key={index}
            side={branch.side}
            top={branch.top + scrollOffset}
            onClick={() => handleBranchClick(branch.side, branch.top)}
          />
        ))}
        <Squirrel position={squirrelSide} top={squirrelTop} />
      </div>
    </div>
  );
};

export default GameArea;
