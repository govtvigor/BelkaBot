// src/components/GameArea.tsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import Squirrel from "../components/Squirrel/Squirrel";
import Branch from "../components/Branch/Branch";
import Score from "../components/Score/Score";
import Lives from "../components/Lives/Lives";
import Menu from "../components/Menu/Menu";
import Profile from "../components/Profile/Profile";
import Leaderboard from "../components/Leaderboard/Leaderboard"; // Ensure correct path
import groundTreeImage from "../assets/groundTree.png";
import startText from "../assets/startText.png";
import { useGameLogic } from "../hooks/useGameLogic";
import { Branch as BranchType } from "../reducers/gameReducer";
import Timer from "../components/Timer/Timer";
import './App.css';
import { resetGame, setGameOver, startGame } from "../actions/gameActions";
import snowBiomeImage from '../assets/snow-biome.png';
import forestBgImage from '../assets/forest-bg-2.png';
import transitionBiomeImage from '../assets/transitionForestToSnow.png'

const GameArea: React.FC = () => {
  const { state, dispatch, handleScreenClick, generateBranches, maxTime } = useGameLogic();
  const [currentScreen, setCurrentScreen] = useState<"game" | "profile" | "leaderboard">("game"); // Updated type

  const [isJumpingToFirstBranch, setIsJumpingToFirstBranch] = useState(false);
  const [isGroundMovingDown, setIsGroundMovingDown] = useState(false);
  const [isTreeMovingUp, setIsTreeMovingUp] = useState(false);
  const [isGroundHidden, setIsGroundHidden] = useState(false);
  const [isTreePositionAdjusted, setIsTreePositionAdjusted] = useState(false);
  const [currentBiomeIndex, setCurrentBiomeIndex] = useState(0);
  const [backgroundOffsetY, setBackgroundOffsetY] = useState(0);



  const groundImageRef = useRef<HTMLImageElement | null>(null);
  const biomes = [
    { image: forestBgImage, points: 0 },
    { image: transitionBiomeImage, points: 50 }, // This is the transition background
    { image: snowBiomeImage, points: 55 }, // Final snow biome after the transition
  ];

  useEffect(() => {
    const newIndex = biomes.findIndex((biome, index) => {
      const nextBiome = biomes[index + 1];
      return state.points >= biome.points && (!nextBiome || state.points < nextBiome.points);
    });

    console.log("New Biome Index:", newIndex);

    if (newIndex !== -1 && newIndex !== currentBiomeIndex) {
      setCurrentBiomeIndex(newIndex);
    }
  }, [state.points]);

  useEffect(() => {
    const backgroundSpeedFactor = 0.1; // Adjust this value to control background speed
    setBackgroundOffsetY(state.scrollOffset * backgroundSpeedFactor);
  }, [state.scrollOffset]);



  // Adjust tree trunk bottom based on ground height
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

  // Generate branches on mount
  useEffect(() => {
    generateBranches();
  }, [generateBranches]);

  const handleMenuClick = (screen: "game" | "profile" | "leaderboard") => { // Updated type
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

    const animationDuration = 1000; // Duration of the jump animation in ms

    setTimeout(() => {
      setIsJumpingToFirstBranch(false);
      dispatch(startGame()); // Use the action creator
      setIsGroundMovingDown(false);
      setIsTreeMovingUp(false);
      setIsGroundHidden(true); // Hide ground-wrapper
      setIsTreePositionAdjusted(true); // Fix the new position of tree-trunk
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

      // Determine the direction of the jump
      if (clickX < screenWidth / 2) {
        handleScreenClick("left");
      } else {
        handleScreenClick("right");
      }
    }
  };


  // Render Profile or Leaderboard based on currentScreen
  if (currentScreen === "profile") {
    return <Profile onMenuClick={handleMenuClick} />;
  }

  if (currentScreen === "leaderboard") {
    return <Leaderboard onMenuClick={handleMenuClick} />;
  }

  // Render Game Screen
  return (
    <div className="game-container">
      <div className="game-area-wrapper">
        {biomes.map((biome, index) => (
          <div
            key={index}
            className={`background-layer ${index === currentBiomeIndex ? 'visible' : 'hidden'}`}
            style={{
              backgroundImage: `url(${biome.image})`,
              backgroundPositionY: `${backgroundOffsetY}px`, // Use updated backgroundOffsetY
            }}
          ></div>
        ))}
        <div
          className={`game-area ${state.inMenu ? "menu-mode" : "game-mode"}`}
          onClick={handleClick}
        >
          {!state.gameStarted && (
            <img className="start-text" src={startText} alt="Start Text" />
          )}

          <div className="tree-wrapper">
            {/* Display groundTreeImage with ref to calculate its height */}
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
            {/* Display main tree trunk */}
            <div
              className={`tree-trunk ${state.gameStarted ? 'fade-in' : ''} ${isTreeMovingUp ? 'move-up' : ''} ${isTreePositionAdjusted ? 'fixed-position' : ''}`}
              style={
                {
                  '--tree-trunk-translate-y': `${state.scrollOffset % window.innerHeight}px`,
                  transition: "transform 0.2s ease-out",
                } as React.CSSProperties
              }
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
                    top={branch.top}
                    onClick={
                      state.gameStarted
                        ? (e) => {
                          e.stopPropagation();
                          handleScreenClick(branch.side);
                        }
                        : undefined // No onClick handler if game hasn't started
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
