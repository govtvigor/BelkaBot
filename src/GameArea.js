import React, { useState, useEffect } from 'react';
import Squirrel from './components/Squirrel/Squirrel';
import Branch from './components/Branch/Branch';
import Score from './components/Score/Score';
import Lives from './components/Lives/Lives';
import Menu from './components/Menu/Menu';
import CloudBig from './components/Clouds/CloudBig';
import CloudSmall from './components/Clouds/CloudSmall';
import mainTreeImage from './assets/mainTree.png';
import groundTreeImage from './assets/groundTree.png';
import startText from './assets/startText.png';

const GameArea = () => {
  const [branches, setBranches] = useState([]);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [squirrelSide, setSquirrelSide] = useState('right');
  const [squirrelTop, setSquirrelTop] = useState(550);
  const [points, setPoints] = useState(0);
  const [lives, setLives] = useState(3);
  const [speed, setSpeed] = useState(5);
  const [gameStarted, setGameStarted] = useState(false);
  const [inMenu, setInMenu] = useState(true);
  const [lifeDeducted, setLifeDeducted] = useState(false);
  const [isMenuClick, setIsMenuClick] = useState(false);
  const [clouds, setClouds] = useState([]);

  useEffect(() => {
    const initialClouds = generateRandomClouds();
    setClouds(initialClouds);
  }, []);

  useEffect(() => {
    if (gameStarted) {
      const interval = setInterval(() => {
        setScrollOffset((prevOffset) => prevOffset + speed);
  
        setClouds((prevClouds) =>
          prevClouds.map((cloud) => ({
            ...cloud,
            top: cloud.top + speed, 
          })).filter(cloud => cloud.top < window.innerHeight)
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
          if (lastBranch) {
            let newBranchTop = lastBranch.top - 250;
            let newBranchSide = Math.random() > 0.5 ? 'left' : 'right';
  
            while (branches.some(branch => Math.abs(newBranchTop - branch.top) < 250)) {
              newBranchTop -= 250;
            }
  
            setBranches((prevBranches) => [
              ...prevBranches,
              { side: newBranchSide, top: newBranchTop },
            ]);
          }
        }
  
        if (Math.random() < 0.02) {
          setClouds((prevClouds) => [...prevClouds, ...generateRandomClouds()]);
        }
      }, 50);
  
      return () => clearInterval(interval);
    }
  }, [scrollOffset, branches, speed, gameStarted, lives, lifeDeducted]);
  
  


  const generateRandomBranch = () => {
    const side = Math.random() > 0.5 ? 'left' : 'right';
    const top = -50; // Ветка появляется за пределами экрана сверху
    return { side, top };
  };

  const startBranchGeneration = () => {
    setTimeout(() => {
      const firstBranch = generateRandomBranch();
      setBranches([firstBranch]);
  
      const interval = setInterval(() => {
        setBranches(prevBranches => {
          const lastBranch = prevBranches[prevBranches.length - 1];
          if (!lastBranch) return prevBranches;
  
          let newBranchTop = lastBranch.top - 250;
          let newBranchSide = Math.random() > 0.5 ? 'left' : 'right';
  
          while (prevBranches.some(branch => Math.abs(newBranchTop - branch.top) < 250)) {
            newBranchTop -= 250;
          }
  
          return [...prevBranches, { side: newBranchSide, top: newBranchTop }];
        });
  
        if (!gameStarted) {
          clearInterval(interval);
        }
      }, 1000); // Интервал появления веток 1 секунда
    }, 1000); // Первая ветка появляется через 1 секунду после старта игры
  };
  
  

  const generateRandomClouds = () => {
    const cloudsArray = [];
    const numberOfClouds = Math.floor(Math.random()) + 1;
    for (let i = 0; i < numberOfClouds; i++) {
      const top = Math.floor(Math.random() * window.innerHeight) - window.innerHeight;
      const left = Math.floor(Math.random() * (window.innerWidth - 100));
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
        startBranchGeneration(); // Начинаем генерацию веток через 1 секунду
      }, 1000);
      return;
    }
    setIsMenuClick(false);
  };

  const handleMenuClick = (event) => {
    event.stopPropagation();
    setIsMenuClick(true);
  };

  const handleBranchClick = (side, top) => {
    const firstBranch = branches[0];
  
    if (firstBranch && side === firstBranch.side && Math.abs(top - firstBranch.top) < 50) {
      setPoints((prevPoints) => prevPoints + 1);
      setSpeed((prevSpeed) => prevSpeed + 0.5);
      setSquirrelSide(side);
      setSquirrelTop(firstBranch.top + scrollOffset - 15);
  
      // Удаление первой ветки
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
    setBranches([]);
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
          {inMenu && (
            <>
              <img
                src={mainTreeImage}
                alt="Main Tree"
                className={`tree-image-main ${gameStarted ? 'fade-in' : ''}`}
                style={{ transform: `translateY(${scrollOffset % window.innerHeight}px)` }}
              />
              <img
                src={groundTreeImage}
                alt="Ground Tree"
                className={`tree-image ${gameStarted ? 'fade-out' : ''}`}
                style={{
                  transform: `translateY(${scrollOffset}px)`,
                  zIndex: gameStarted ? -1 : 1,
                }}
              />
            </>
          )}

          {!inMenu && (
            <>
              <img
                src={mainTreeImage}
                alt="Tree"
                className="tree-image-main"
                style={{ transform: `translateY(${scrollOffset % window.innerHeight}px)` }}
              />
              <img
                src={mainTreeImage}
                alt="Tree"
                className="tree-image-main"
                style={{ transform: `translateY(${(scrollOffset % window.innerHeight) - window.innerHeight}px)` }}
              />
              <img
                src={mainTreeImage}
                alt="Tree"
                className="tree-image-main"
                style={{ transform: `translateY(${(scrollOffset % window.innerHeight) - window.innerHeight * 2}px)` }}
              />
              <img
                src={mainTreeImage}
                alt="Tree"
                className="tree-image-main"
                style={{ transform: `translateY(${(scrollOffset % window.innerHeight) - window.innerHeight * 3}px)` }}
              />
            </>
          )}
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
          <Squirrel position={squirrelSide} top={squirrelTop} isInGame={gameStarted} />

        </div>
      </div>

      {inMenu && <Menu onClick={handleMenuClick} />}
    </div>
  );
};

export default GameArea;
