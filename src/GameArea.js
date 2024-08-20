import React, { useState, useEffect } from 'react';
import Squirrel from './components/Squirrel/Squirrel';
import Branch from './components/Branch/Branch';
import Score from './components/Score/Score';
import Lives from './components/Lives/Lives';
import Menu from './components/Menu/Menu';
import CloudBig from './components/Clouds/CloudBig'; // Добавляем компонент большого облака
import CloudSmall from './components/Clouds/CloudSmall'; // Добавляем компонент маленького облака
import treeImage from './assets/tree.png';
import startText from './assets/startText.png';

const GameArea = () => {
  const [branches, setBranches] = useState([]);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [squirrelSide, setSquirrelSide] = useState('right');
  const [squirrelTop, setSquirrelTop] = useState(625);
  const [points, setPoints] = useState(0);
  const [lives, setLives] = useState(3);
  const [speed, setSpeed] = useState(5);
  const [gameStarted, setGameStarted] = useState(false);
  const [inMenu, setInMenu] = useState(true);
  const [lifeDeducted, setLifeDeducted] = useState(false);
  const [isMenuClick, setIsMenuClick] = useState(false);
  const [clouds, setClouds] = useState([]); // Массив для хранения облаков

  useEffect(() => {
    const initialBranches = [
      { side: 'left', top: 400 },
      { side: 'right', top: 150 },
    ];
    setBranches(initialBranches);

    // Генерация начальных облаков
    const initialClouds = generateRandomClouds();
    setClouds(initialClouds);
  }, []);

  useEffect(() => {
    if (gameStarted) {
      const interval = setInterval(() => {
        setScrollOffset((prevOffset) => prevOffset + speed);

        // Обновление позиций облаков
        setClouds((prevClouds) =>
            prevClouds.map((cloud) => ({
              ...cloud,
              top: cloud.top + speed, // Движение облаков вниз
            })).filter(cloud => cloud.top < window.innerHeight) // Удаляем облака, которые вышли за экран
        );

        if (branches.length > 0 && branches[0].top + scrollOffset >= window.innerHeight) {
          if (!lifeDeducted) {
            setLives((prevLives) => prevLives - 1);
            setLifeDeducted(true);

            if (lives - 1 <= 0) {
              alert('Game over! No more lives left.');
              resetGame();
              return;
            }
          }
          setBranches((prevBranches) => prevBranches.slice(1));
          setLifeDeducted(false);
        }

        if (branches.length > 0) {
          const lastBranch = branches[branches.length - 1];
          if (lastBranch.top + scrollOffset < window.innerHeight - 200) {
            const newBranchSide = Math.random() > 0.5 ? 'left' : 'right';
            const newBranchTop = lastBranch.top - 250;
            setBranches((prevBranches) => [
              ...prevBranches,
              { side: newBranchSide, top: newBranchTop },
            ]);
          }
        }

        // Добавление новых облаков
        if (Math.random() < 0.02) { // 2% вероятность генерации нового облака в каждом интервале
          setClouds((prevClouds) => [...prevClouds, ...generateRandomClouds()]);
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [scrollOffset, branches, speed, gameStarted, lives, lifeDeducted]);

  const generateRandomClouds = () => {
    const cloudsArray = [];
    const numberOfClouds = Math.floor(Math.random()) +1; // Случайное количество облаков (1-2)
    for (let i = 0; i < numberOfClouds; i++) {
      const top = Math.floor(Math.random() * window.innerHeight) - window.innerHeight; // Генерация за экраном
      const left = Math.floor(Math.random() * (window.innerWidth - 100)); // Рандомное положение по ширине
      const isBigCloud = Math.random() > 0.5;
      cloudsArray.push({
        id: `${isBigCloud ? 'big' : 'small'}-${Date.now()}-${i}`,
        top,
        left,
        isBigCloud,
      });
    }
    return cloudsArray;
  };

  const handleScreenClick = () => {
    if (!gameStarted && !isMenuClick) {
      setInMenu(false);
      setTimeout(() => {
        setGameStarted(true);
      }, 1000);
      return;
    }
    setIsMenuClick(false); // Сбрасываем после обработки
  };

  const handleMenuClick = (event) => {
    event.stopPropagation(); // Останавливаем распространение события
    setIsMenuClick(true); // Устанавливаем состояние, если клик был на меню
  };

  const handleBranchClick = (side, top) => {
    const firstBranch = branches[0];

    if (firstBranch && side === firstBranch.side && top + scrollOffset === firstBranch.top + scrollOffset) {
      setPoints((prevPoints) => prevPoints + 1);
      setSpeed((prevSpeed) => prevSpeed + 0.5);
      setSquirrelSide(side);
      setSquirrelTop(top + scrollOffset - 15);

      setBranches((prevBranches) => prevBranches.slice(1));
      setLifeDeducted(false);
    } else {
      setLives((prevLives) => prevLives - 1);
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
    setInMenu(true);
    setLifeDeducted(false);
    setBranches([
      { side: 'left', top: 400 },
      { side: 'right', top: 150 },
    ]);
    setSquirrelSide('right');
  };

  return (
      <div className="game-container">
        <div className={`game-area ${inMenu ? 'menu-mode' : 'game-mode'}`} onClick={handleScreenClick}>
          {!gameStarted && (
              <img
                  className="start-text"
                  src={startText}
                  alt="Start Text"
              />
          )}

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

          {clouds.map((cloud) =>
              cloud.isBigCloud ? (
                  <CloudBig key={cloud.id} top={cloud.top} left={cloud.left} />
              ) : (
                  <CloudSmall key={cloud.id} top={cloud.top} left={cloud.left} />
              )
          )}

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

        {inMenu && <Menu onClick={handleMenuClick} />} {/* Передаем обработчик кликов в меню */}
      </div>
  );
};

export default GameArea;
