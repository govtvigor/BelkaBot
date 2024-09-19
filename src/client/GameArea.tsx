// src/components/GameArea.tsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import Squirrel from "../components/sprites/Squirrel/Squirrel";
import Branch from "../components/Branch/Branch";
import Score from "../components/Score/Score";
import Lives from "../components/Lives/Lives";
import Menu from "../components/Menu/Menu";
import Profile from "../components/Profile/Profile";
import groundTreeImage from "../assets/groundTree.png";
import startText from "../assets/startText.png";
import { useGameLogic } from "../hooks/useGameLogic";
import { Branch as BranchType } from "../reducers/gameReducer";
import Timer from "../components/Timer/Timer";
import './App.css';
import { resetGame, setGameOver, startGame } from "../actions/gameActions"; // Ensure startGame is imported

const GameArea: React.FC = () => {
  const { state, dispatch, handleScreenClick, generateBranches } = useGameLogic();
  const [currentScreen, setCurrentScreen] = useState<"game" | "profile">("game");

  const [isJumpingToFirstBranch, setIsJumpingToFirstBranch] = useState(false);
  const [isGroundMovingDown, setIsGroundMovingDown] = useState(false);
  const [isTreeMovingUp, setIsTreeMovingUp] = useState(false);
  const [isGroundHidden, setIsGroundHidden] = useState(false);
  const [isTreePositionAdjusted, setIsTreePositionAdjusted] = useState(false);

  const groundImageRef = useRef<HTMLImageElement | null>(null);

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

  const handleMenuClick = (screen: "game" | "profile") => {
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

      if (clickX < screenWidth / 2) {
        handleScreenClick("left");
      } else {
        handleScreenClick("right");
      }
    }
  };

  if (currentScreen === "profile") {
    return <Profile onMenuClick={handleMenuClick} />;
  }

  return (
    <div className="game-container">
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
        <Timer timeLeft={state.timeLeft} />
        <Score points={state.points} />

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
