import React, { useState, useEffect } from 'react';
import Squirrel from './Squirrel';
import Branch from './Branch';
import treeImage from './assets/tree.png'; // Импорт дерева

const GameArea = () => {
  const [score, setScore] = useState(0);
  const [position, setPosition] = useState('center'); // Начальная позиция белки по центру
  const [branches, setBranches] = useState([]); // Список веток

  useEffect(() => {
    // Инициализация игры
    addNewBranch();
  }, []);

  useEffect(() => {
    if (branches.length > 0) {
      const gameLoop = setInterval(() => {
        // Белка прыгает вверх
        setPosition(branches[0].side);
        // Добавляем новую ветку и удаляем первую (как бы поднимаемся вверх)
        setBranches(prevBranches => prevBranches.slice(1));
        addNewBranch();
      }, 1000); // Задаем интервал прыжков

      return () => clearInterval(gameLoop);
    }
  }, [branches]);

  const addNewBranch = () => {
    const side = Math.random() > 0.5 ? 'left' : 'right';
    setBranches(prevBranches => [...prevBranches, { side }]);
  };

  return (
    <div className="game-area">
      <img src={treeImage} alt="Tree" className="tree" />
      <div className="branches">
        {branches.map((branch, index) => (
          <Branch key={index} side={branch.side} />
        ))}
        <Squirrel position={position} />
      </div>
    </div>
  );
};

export default GameArea;
