import React, { useState, useEffect } from 'react';
import Squirrel from './Squirrel';
import Branch from './Branch';
import treeImage from './assets/tree.png';

const GameArea = () => {
  const [position, setPosition] = useState('right'); // Белка начинает справа
  const [branches, setBranches] = useState([]); // Ветки будут храниться здесь
  const [squirrelTop, setSquirrelTop] = useState(500); // Начальная высота белки

  useEffect(() => {
    // Добавляем первую ветку слева
    setBranches([{ side: 'left', top: 200 }]); // Первая ветка всегда слева и выше белки
  }, []);

  const handleBranchClick = (side, top) => {
    setPosition(side); // Белка прыгает на сторону ветки
    setSquirrelTop(top); // Белка поднимается вверх на уровень ветки

    // Удаляем предыдущую ветку
    setBranches(prevBranches => prevBranches.slice(1));

    // Добавляем новую ветку выше предыдущей
    const newBranchSide = Math.random() > 0.5 ? 'left' : 'right';
    const newBranchTop = top - 100; // Ветка выше предыдущей
    setBranches(prevBranches => [
      ...prevBranches,
      { side: newBranchSide, top: newBranchTop },
    ]);
  };

  return (
    <div className="game-area">
      <img src={treeImage} alt="Tree" className="tree" />
      <div className="branches">
        {branches.map((branch, index) => (
          <Branch
            key={index}
            side={branch.side}
            top={branch.top}
            onClick={() => handleBranchClick(branch.side, branch.top)}
          />
        ))}
        <Squirrel position={position} top={squirrelTop} />
      </div>
    </div>
  );
};

export default GameArea;
