import React, { useState, useEffect } from 'react';
import Squirrel from './Squirrel';
import Branch from './Branch';
import Score from './Score';
import Lives from './Lives'; // Новый компонент для отображения жизней
import treeImage from './assets/tree.png';

const GameArea = () => {
  const [branches, setBranches] = useState([]);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [squirrelSide, setSquirrelSide] = useState('right');
  const [squirrelTop, setSquirrelTop] = useState(500);
  const [points, setPoints] = useState(0);
  const [lives, setLives] = useState(3); // Начальное количество жизней
  const [speed, setSpeed] = useState(5);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const initialBranches = [
      { side: 'left', top: 400 },
      { side: 'right', top: 300 },
      { side: 'left', top: 200 },
    ];
    setBranches(initialBranches);
  }, []);

  useEffect(() => {
    if (gameStarted) {
      const interval = setInterval(() => {
        setScrollOffset(prevOffset => prevOffset + speed);

        // Удаление веток, которые вышли за экран
        setBranches(prevBranches => prevBranches.filter(branch => branch.top + scrollOffset < window.innerHeight));

        // Добавление новой ветки с меньшей частотой
        if (Math.random() > 0.7) { // Уменьшаем вероятность появления новой ветки
          const lastBranch = branches[branches.length - 1];
          if (lastBranch && lastBranch.top + scrollOffset > 100) {
            const newBranchSide = Math.random() > 0.5 ? 'left' : 'right';
            const newBranchTop = lastBranch.top - 200; // Увеличиваем интервал между ветками
            setBranches(prevBranches => [
              ...prevBranches,
              { side: newBranchSide, top: newBranchTop },
            ]);
          }
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [scrollOffset, branches, speed, gameStarted]);

  const handleBranchClick = (side, top) => {
    if (!gameStarted) {
      setGameStarted(true);
    }

    if (side !== squirrelSide) {
      setLives(prevLives => prevLives - 1); // Уменьшаем жизнь, если клик на неправильную сторону
      if (lives <= 1) {
        alert('Game over! No more lives left.');
        setGameStarted(false); // Останавливаем игру
        setLives(3); // Сбрасываем жизни для новой игры
        setPoints(0); // Сбрасываем очки
        setSpeed(5); // Сбрасываем скорость
        setScrollOffset(0); // Сбрасываем прокрутку
        return;
      }
    } else {
      setPoints(prevPoints => prevPoints + 1);
      setSpeed(prevSpeed => prevSpeed + 0.5);
      setSquirrelSide(side);
      setSquirrelTop(top + scrollOffset - 45);
      setBranches(prevBranches => prevBranches.slice(1));
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
