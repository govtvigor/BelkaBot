import React, { useState, useEffect, useRef, useCallback } from "react";
import Squirrel from "../components/sprites/Squirrel/Squirrel";
import Branch from "../components/Branch/Branch";
import Score from "../components/Score/Score";
import Lives from "../components/Lives/Lives";
import Menu from "../components/Menu/Menu";
import Profile from "../components/Profile/Profile";
import Leaderboard from "../components/Leaderboard/Leaderboard";
import groundTreeImage from "../assets/groundTree.png";
import startText from "../assets/startText.png";
import { useGameLogic } from "../hooks/useGameLogic";
import { Branch as BranchType } from "../reducers/gameReducer";
import Timer from "../components/Timer/Timer";
import './App.css';
import { resetGame, setGameOver, startGame } from "../actions/gameActions";
import snowBiomeImage from '../assets/snow-biome.png';
import forestBgImage from '../assets/forest-bg-2.png';
import transitionBiomeImage from '../assets/transitionForestToSnow.png';

const GameArea: React.FC = () => {
  const { state, dispatch, handleScreenClick, generateBranches, maxTime } = useGameLogic();
  const [currentScreen, setCurrentScreen] = useState<"game" | "profile" | "leaderboard">("game");

  const [isJumpingToFirstBranch, setIsJumpingToFirstBranch] = useState(false);
  const [isGroundMovingDown, setIsGroundMovingDown] = useState(false);
  const [isTreeMovingUp, setIsTreeMovingUp] = useState(false);
  const [isGroundHidden, setIsGroundHidden] = useState(false);
  const [isTreePositionAdjusted, setIsTreePositionAdjusted] = useState(false);
  const [backgroundOffsetY, setBackgroundOffsetY] = useState(0);

  const groundImageRef = useRef<HTMLImageElement | null>(null);
  const biomes = [
    { image: snowBiomeImage, points: 13 },
    { image: transitionBiomeImage, points: 10 },
    { image: forestBgImage, points: 0 },
    
    
  ];

  // Синхронизация backgroundOffsetY с scrollOffset
  useEffect(() => {
    setBackgroundOffsetY(state.scrollOffset);
  }, [state.scrollOffset]);

  // Корректировка нижнего отступа ствола дерева на основе высоты земли
  useEffect(() => {
    const groundImage = groundImageRef.current;
    if (groundImage) {
      const setTrunkBottom = () => {
        const groundHeight = groundImage.clientHeight;
        console.log('Ground Height:', groundHeight);
        document.documentElement.style.setProperty('--tree-trunk-bottom', `${groundHeight}px`);
        document.documentElement.style.setProperty('--tree-trunk-bottom-mobile', `${groundHeight}px`);
      };

      if (groundImage.complete) {
        setTrunkBottom();
      } else {
        groundImage.onload = setTrunkBottom;
      }

      window.addEventListener('resize', setTrunkBottom);

      return () => {
        window.removeEventListener('resize', setTrunkBottom);
      };
    }
  }, [state.gameStarted]);

  // Генерация веток при монтировании компонента
  useEffect(() => {
    generateBranches();
  }, [generateBranches]);

  const handleMenuClick = (screen: "game" | "profile" | "leaderboard") => {
    setCurrentScreen(screen);
  };

  const handleGameStartWithJump = useCallback(() => {
    if (state.lives <= 0) {
      alert('You have no lives left. Please buy more lives in your profile.');
      return;
    }

    setIsJumpingToFirstBranch(true);
    setIsGroundMovingDown(true);
    setIsTreeMovingUp(true);

    const animationDuration = 1000; // Длительность анимации прыжка в мс

    setTimeout(() => {
      setIsJumpingToFirstBranch(false);
      dispatch(startGame()); // Используем action creator
      setIsGroundMovingDown(false);
      setIsTreeMovingUp(false);
      setIsGroundHidden(true); // Скрываем ground-wrapper
      setIsTreePositionAdjusted(true); // Фиксируем новое положение ствола дерева
    }, animationDuration);
  }, [state.lives, dispatch]);

  const resetGameHandler = useCallback(() => {
    setIsJumpingToFirstBranch(false);
    setIsGroundMovingDown(false);
    setIsTreeMovingUp(false);
    setIsGroundHidden(false);
    setIsTreePositionAdjusted(false);

    dispatch(resetGame());
    dispatch(setGameOver(false));
    generateBranches();
  }, [dispatch, generateBranches]);

  const handleClick = (event: React.MouseEvent) => {
    if (!state.gameStarted) {
      handleGameStartWithJump();
    } else {
      const clickX = event.clientX;
      const screenWidth = window.innerWidth;

      // Определяем направление прыжка
      if (clickX < screenWidth / 2) {
        handleScreenClick("left");
      } else {
        handleScreenClick("right");
      }
    }
  };

  // Рендер профиля или лидерборда на основе текущего экрана
  if (currentScreen === "profile") {
    return <Profile onMenuClick={handleMenuClick} />;
  }

  if (currentScreen === "leaderboard") {
    return <Leaderboard onMenuClick={handleMenuClick} />;
  }

  // Рендер игрового экрана
  return (
    <div className="game-container">
      <div className="game-area-wrapper" onClick={handleClick}>
        <div
          className="background-wrapper"
          style={{
            transform: `translateY(${backgroundOffsetY}px)`,
            transition: 'none', // Убираем анимацию
            height: `${biomes.length * 200}vh`,
          }}
        >
          {biomes.map((biome, index) => (
            <div
              key={index}
              className="background-biome"
              style={{
                backgroundImage: `url(${biome.image})`,
              }}
            ></div>
          ))}
        </div>

        {!state.gameStarted && (
          <img className="start-text" src={startText} alt="Start Text" />
        )}

        <div className="tree-wrapper">
          {/* Отображение groundTreeImage с ref для расчета его высоты */}
          {!isGroundHidden && (
            <div className={`ground-wrapper ${isGroundMovingDown ? 'move-down' : ''}`}>
              <img
                src={groundTreeImage}
                alt="Ground"
                ref={groundImageRef}
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          )}
          {/* Отображение основного ствола дерева */}
          <div
            className={`tree-trunk ${state.gameStarted ? 'fade-in' : ''} ${isTreeMovingUp ? 'move-up' : ''} ${isTreePositionAdjusted ? 'fixed-position' : ''}`}
            style={{
              /* Удаляем transform, чтобы ствол оставался фиксированным */
            } as React.CSSProperties}
          />
        </div>

        {state.isLivesLoading ? (
          <div>Loading lives...</div>
        ) : (
          <Lives lives={state.lives} />
        )}

        {state.gameStarted && (
          <div className="timer-score-container">
            <Timer timeLeft={state.timeLeft} maxTime={maxTime} />
            <Score points={state.points} />
          </div>
        )}

        {state.branches.length > 0 && (
          <div className="branches">
            {state.branches
              .filter((branch, index) => state.gameStarted || index !== state.branches.length - 1)
              .map((branch: BranchType, index: number) => (
                <Branch
                  key={index}
                  side={branch.side}
                  top={branch.top - state.scrollOffset} 
                  onClick={
                    state.gameStarted
                      ? (e) => {
                          e.stopPropagation();
                          handleScreenClick(branch.side);
                        }
                      : undefined
                  }
                />
              ))}
          </div>
        )}

        <Squirrel
          position={state.squirrelSide}
          isInGame={state.gameStarted}
          isJumpingToFirstBranch={isJumpingToFirstBranch}
        />
      </div>

      {state.inMenu && (
        <div>
          <Menu onMenuClick={handleMenuClick} />
        </div>
      )}

      {state.gameOver && (
        <div className="game-over-screen">
          <h2>Game Over</h2>
          <p>Your Score: {state.points}</p>
          <button onClick={resetGameHandler}>Play Again</button>
        </div>
      )}
    </div>
  );
};

export default GameArea;
