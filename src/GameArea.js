import React, { useState, useEffect } from 'react';
import Squirrel from './Squirrel';
import Branch from './Branch';
import treeImage from './assets/tree.png';

const GameArea = () => {
  const [branches, setBranches] = useState([]);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [squirrelSide, setSquirrelSide] = useState('right');
  const [squirrelTop, setSquirrelTop] = useState(500);

  useEffect(() => {
    // Инициализация веток
    const initialBranches = [
      { side: 'left', top: 400 },
      { side: 'right', top: 300 },
      { side: 'left', top: 200 },
    ];
    setBranches(initialBranches);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setScrollOffset(prevOffset => prevOffset + 5);

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
  }, [scrollOffset, branches]);

  const handleBranchClick = (side, top) => {
    setSquirrelSide(side);
    setSquirrelTop(top + scrollOffset - 50);

    // Удаляем предыдущую ветку только после прыжка на новую
    setBranches(prevBranches => prevBranches.slice(1));
  };

  return (
    <div className="game-area">
      {/* Циклическое дерево */}
      <div className="tree" style={{ transform: `translateY(${scrollOffset % window.innerHeight}px)` }}>
        <img src={treeImage} alt="Tree" className="tree-image" />
        <img src={treeImage} alt="Tree" className="tree-image" style={{ top: '-100%' }} />
      </div>
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
