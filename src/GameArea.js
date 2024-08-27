import React, { useState, useEffect, useRef } from 'react';
import Squirrel from './components/sprites/Squirrel/Squirrel';
import Branch from './components/Branch/Branch';
import Score from './components/Score/Score';
import Lives from './components/Lives/Lives';
import Menu from './components/Menu/Menu';
import CloudBig from './components/sprites/Clouds/CloudBig';
import CloudSmall from './components/sprites/Clouds/CloudSmall';
import ButterflyBlue from "./components/sprites/Butterflies/ButterflyBlue";
import ButterflyGreen from "./components/sprites/Butterflies/ButterflyGreen";
import mainTreeImage from './assets/mainTree.png';
import groundTreeImage from './assets/groundTree.png';
import startText from './assets/startText.png';
import Timer from './components/Timer/Timer';
import Bonus from './components/sprites/Bonus/Bonus';


const GameArea = () => {
  const [branches, setBranches] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
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
  const [butterflies, setButterflies] = useState([]);
  const [bonusActive, setBonusActive] = useState(false);
  const [bonusTimer, setBonusTimer] = useState(0);
  const [bonuses, setBonuses] = useState([]);
  const bonusTimeoutRef = useRef(null);
  const bonusActiveRef = useRef(false);



  useEffect(() => {
    const initialClouds = generateRandomClouds();
    setClouds(initialClouds);
  }, []);

  useEffect(() => {
    if (gameStarted) {
      const speedInterval = setInterval(() => {
        setSpeed((prevSpeed) => Math.min(prevSpeed + 0.1, 40));
      }, 2000);

      return () => clearInterval(speedInterval);
    }
  }, [gameStarted]);


  useEffect(() => {
    if (gameStarted) {
      const timerInterval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerInterval);
            handleTimeUp();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timerInterval);
    }
  }, [gameStarted]);

  const generateRandomButterfly = () => {
    const top = -50;
    const left = Math.floor(Math.random() * window.innerWidth);
    const isBlueButterfly = Math.random() > 0.5;

    return {
      id: `${isBlueButterfly ? 'blue' : 'green'}-${Date.now()}`,
      top,
      left,
      isBlueButterfly,
    };
  };

  const handleBonusActivation = () => {
    setBonusActive(true);
    bonusActiveRef.current = true;
    if (bonusTimeoutRef.current) {
      clearTimeout(bonusTimeoutRef.current);
    }

    bonusTimeoutRef.current = setTimeout(() => {
      setBonusActive(false);
      bonusActiveRef.current = false;
    }, 5000);
  };

  useEffect(() => {
    if (points > 0) {
      const baseIncrement = 1;
      const decrement = Math.floor(points / 50) * 0.1;
      const timeIncrement = Math.max(baseIncrement - decrement, 0.1);
      setTimeLeft((prevTime) => Math.min(prevTime + timeIncrement, 60));
    }
  }, [points]);


  useEffect(() => {
    return () => {

      if (bonusTimeoutRef.current) {
        clearTimeout(bonusTimeoutRef.current);
        bonusTimeoutRef.current = null;
      }
    };
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

        setButterflies((prevButterflies) =>
          prevButterflies.map((butterfly) => {
            const newLeft = butterfly.left + (Math.sin(butterfly.top / 50) * 5);
            return {
              ...butterfly,
              top: butterfly.top + speed,
              left: newLeft
            };
          }).filter(butterfly => butterfly.top < window.innerHeight)
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

            
            if ((branches.length + 1) % 15 === 0) {
              setBonuses(prevBonuses => [...prevBonuses, { top: newBranchTop, side: newBranchSide }]);
              
            }
          }
        }

        if (Math.random() < 0.02) {
          setClouds((prevClouds) => [...prevClouds, ...generateRandomClouds()]);
        }
        if (Math.random() < 0.02) {
          setButterflies((prevButterflies) => [...prevButterflies, generateRandomButterfly()]);
        }

        if (bonusActive) {
          setBonusTimer((prevTimer) => {
            if (prevTimer > 1) {
              return prevTimer - 1;
            } else {
              setBonusActive(false);
              return 0;
            }
          });
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [scrollOffset, branches, speed, gameStarted, lives, lifeDeducted, bonusActive]);


  const handleTimeUp = () => {
    alert('Time is up! Game over.');
    resetGame();
  };

  const generateRandomBranch = () => {
    const side = Math.random() > 0.5 ? 'left' : 'right';
    const top = -50; 
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
      }, 1000); 
    }, 1000); 
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
        startBranchGeneration(); 
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
      
      const collectedBonusIndex = bonuses.findIndex(
        (bonus) => Math.abs(top - bonus.top) < 50 && side === bonus.side
      );

      if (collectedBonusIndex !== -1) {
        handleBonusActivation();
        setBonuses((prevBonuses) =>
          prevBonuses.filter((_, index) => index !== collectedBonusIndex)
        );
      }

      setPoints((prevPoints) => {
        const pointsToAdd = bonusActiveRef.current ? 2 : 1;
        const newPoints = prevPoints + pointsToAdd;
        return newPoints;
      });

     
      setSpeed((prevSpeed) => Math.min(prevSpeed + 0.4, 40)); 
      
      setSquirrelSide(side);
      setSquirrelTop(firstBranch.top + scrollOffset - 15);
      setBranches((prevBranches) => prevBranches.slice(1));
      setLifeDeducted(false);
    } else {
     
      setLives((prevLives) => prevLives - 1);
      setSquirrelSide(side);
      setSquirrelTop(top + scrollOffset - 15);
      setBranches((prevBranches) =>
        prevBranches.filter((branch) => branch.top + scrollOffset < top + scrollOffset)
      );
      setLifeDeducted(false);
      if (lives - 1 <= 0) {
        alert("Game over! No more lives left.");
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
    setTimeLeft(30);
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
        <Timer timeLeft={timeLeft} />
        <Score points={points} />

        {clouds.map((cloud) =>
          cloud.isBigCloud ? (
            <CloudBig key={cloud.id} top={cloud.top} left={cloud.left} />
          ) : (
            <CloudSmall key={cloud.id} top={cloud.top} left={cloud.left} />
          )
        )}

        {butterflies.map((butterfly) =>
          butterfly.isBlueButterfly ? (
            <ButterflyBlue key={butterfly.id} top={butterfly.top} left={butterfly.left} />
          ) : (
            <ButterflyGreen key={butterfly.id} top={butterfly.top} left={butterfly.left} />
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

          {bonuses.map((bonus, index) => (
            <Bonus
              key={index}
              top={bonus.top + scrollOffset - 15}
              left={bonus.side === 'left' ? '5%' : '45%'}
            />
          ))}

          <Squirrel position={squirrelSide} isInGame={gameStarted} />

        </div>

      </div>

      {inMenu && <Menu onClick={handleMenuClick} />}
    </div>
  );
};

export default GameArea;
