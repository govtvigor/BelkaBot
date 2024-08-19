import React, { useState, useEffect } from 'react';
import Squirrel from './components/Squirrel/Squirrel';
import Branch from './components/Branch/Branch';
import Score from './components/Score/Score';
import Lives from './components/Lives/Lives';
import treeImage from './assets/tree.png';
import startText from "./assets/startText.png";

const GameArea = () => {
  const [branches, setBranches] = useState([]);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [squirrelSide, setSquirrelSide] = useState('right');
  const [squirrelTop, setSquirrelTop] = useState(500);
  const [points, setPoints] = useState(0);
  const [lives, setLives] = useState(3);
  const [speed, setSpeed] = useState(5);
  const [gameStarted, setGameStarted] = useState(false);
  const [lifeDeducted, setLifeDeducted] = useState(false); // отслеживание жизни за текущую ветку

  useEffect(() => {
    const initialBranches = [
      { side: 'left', top: 400 },
      { side: 'right', top: 150 },
    ];
    setBranches(initialBranches);
  }, []);

  useEffect(() => {
    if (gameStarted) {
      const interval = setInterval(() => {
        setScrollOffset(prevOffset => prevOffset + speed);

        // Проверка первой ветки на выход за экран и отнимание жизни
        if (branches.length > 0 && branches[0].top + scrollOffset >= window.innerHeight) {
          if (!lifeDeducted) {
            setLives(prevLives => prevLives - 1);
            setLifeDeducted(true); // отметка, что жизнь была отнята за эту ветку

            if (lives - 1 <= 0) {
              alert('Game over! No more lives left.');
              resetGame();
              return;
            }
          }
          // Удаление первой ветки и сброс lifeDeducted
          setBranches(prevBranches => prevBranches.slice(1));
          setLifeDeducted(false);
        }

        // Добавление новой ветки
        if (branches.length > 0) {
          const lastBranch = branches[branches.length - 1];
          if (lastBranch.top + scrollOffset < window.innerHeight - 200) {
            const newBranchSide = Math.random() > 0.5 ? 'left' : 'right';
            const newBranchTop = lastBranch.top - 250;
            setBranches(prevBranches => [
              ...prevBranches,
              { side: newBranchSide, top: newBranchTop },
            ]);
          }
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [scrollOffset, branches, speed, gameStarted, lives, lifeDeducted]);


  const handleScreenClick = () => { //обробник я переніс в GameArea, бо тепер у нас є стартовий текст
    if (!gameStarted) {
      setGameStarted(true);
      return;
    }
  };

  const handleBranchClick = (side, top) => {

    const firstBranch = branches[0];

    if (firstBranch && side === firstBranch.side && top + scrollOffset === firstBranch.top + scrollOffset) {
      setPoints(prevPoints => prevPoints + 1);
      setSpeed(prevSpeed => prevSpeed + 0.5);
      setSquirrelSide(side);
      setSquirrelTop(top + scrollOffset - 15);

      // Удаление текущей ветки после прыжка
      setBranches(prevBranches => prevBranches.slice(1));
      setLifeDeducted(false); // сброс lifeDeducted, чтобы жизнь не отнималась за следующую ветку
    } else {
      setLives(prevLives => prevLives - 1);
      if (lives - 1 <= 0) {
        alert('Game over! No more lives left.');
        resetGame();
        return;
      }
    }
  };

  const resetGame = () => {
    setLives(3);
    setPoints(0);
    setSpeed(5);
    setScrollOffset(0);
    setSquirrelTop(500);
    setGameStarted(false);
    setLifeDeducted(false); // сброс состояния lifeDeducted
    setBranches([
      { side: 'left', top: 400 },
      { side: 'right', top: 150 },
    ]);
    setSquirrelSide('right');
  };

  return (
    <div className="game-area" onClick={handleScreenClick}>
      {!gameStarted && (
          <img
              src={startText}
              alt="Start Text"
              className="start-text"
              onClick={() => setGameStarted(true)}
          />
      )}

      <div className="tree-wrapper">
        <img
            src={treeImage}
            alt="Tree"
            className="tree-image"
            style={{transform: `translateY(${scrollOffset % window.innerHeight}px)` }}
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