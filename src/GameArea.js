import React, { useState, useEffect } from 'react';
import Squirrel from './Squirrel';
import Branch from './Branch';
import Score from './Score';
import treeImage from './assets/tree.png';

const GameArea = () => {
  const [branches, setBranches] = useState([]);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [squirrelSide, setSquirrelSide] = useState('right');
  const [squirrelTop, setSquirrelTop] = useState(500);
  const [points, setPoints] = useState(0);
  const [speed, setSpeed] = useState(5);
  const [gameStarted, setGameStarted] = useState(false); // Состояние для отслеживания старта игры

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

        // Добавление новой ветки
        const lastBranch = branches[branches.length - 1];
        if (lastBranch && lastBranch.top + scrollOffset > 100) {
          const newBranchSide = Math.random() > 0.5 ? 'left' : 'right';
          const newBranchTop = lastBranch.top - 100;
          setBranches(prevBranches => [
            ...prevBranches,
            { side: newBranchSide, top: newBranchTop },
          ]);
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [scrollOffset, branches, speed, gameStarted]);

  const handleBranchClick = (side, top) => {
    if (!gameStarted) {
      setGameStarted(true); // Игра начинается с первого клика
    }

    setSquirrelSide(side);
    setSquirrelTop(top + scrollOffset - 45); // Корректируем позицию белки, чтобы она сидела ближе к ветке
    setPoints(prevPoints => prevPoints + 1);
    setSpeed(prevSpeed => prevSpeed + 0.5);

    setBranches(prevBranches => prevBranches.slice(1));
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
