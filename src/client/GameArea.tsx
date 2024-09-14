import React, { useState } from "react";
import Squirrel from "../components/sprites/Squirrel/Squirrel";
import Branch from "../components/Branch/Branch";
import Score from "../components/Score/Score";
import Lives from "../components/Lives/Lives";
import Menu from "../components/Menu/Menu";
import Profile from "../components/Profile/Profile";
import mainTreeImage from "../assets/mainTree.png";
import groundTreeImage from "../assets/groundTree.png"; // Вернул groundTreeImage
import startText from "../assets/startText.png";
import { useGameLogic } from "../hooks/useGameLogic";
import { Branch as BranchType } from "../reducers/gameReducer";

const GameArea: React.FC = () => {
  const { state, handleGameStart, handleScreenClick, resetGame } =
    useGameLogic();
  const [currentScreen, setCurrentScreen] = useState<"game" | "profile">(
    "game"
  );

  const handleMenuClick = (screen: "game" | "profile") => {
    setCurrentScreen(screen);
  };

  // Обработка клика по экрану
  const handleClick = (event: React.MouseEvent) => {
    // Проверяем, началась ли игра
    if (!state.gameStarted) {
      handleGameStart(); // Старт игры, если она еще не начата
    } else {
      const clickX = event.clientX;
      const screenWidth = window.innerWidth;

      if (clickX < screenWidth / 2) {
        handleScreenClick("left"); // Клик по левой стороне
      } else {
        handleScreenClick("right"); // Клик по правой стороне
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
          {/* Добавляем отображение groundTreeImage */}
          {!state.gameStarted && (
            <img
              src={groundTreeImage}
              alt="Ground Tree"
              className="tree-image"
              style={{
                transform: `translateY(${state.scrollOffset}px)`,
                transition: "transform 2s ease-out",
                zIndex: state.gameStarted ? -1 : 1,
              }}
            />
          )}
          {/* Отображение основного дерева */}
          <img
            src={mainTreeImage}
            alt="Main Tree"
            className="tree-image-main"
            style={{
              transform: `translateY(${state.scrollOffset % window.innerHeight}px)`,
              transition: "transform 0.2s ease-out",
            }}
          />
        </div>

        {state.lives !== null ? (
          <Lives lives={state.lives} />
        ) : (
          <div>Loading lives...</div>
        )}
        <Score points={state.points} />

        {state.branches.length > 0 && !state.gameOver && (
          <div className="branches">
            {state.branches.map((branch: BranchType, index: number) => (
              <Branch
                key={index}
                side={branch.side}
                top={branch.top}
                onClick={() => handleScreenClick(branch.side)}
              />
            ))}
          </div>
        )}

        <Squirrel
          position={state.squirrelSide}
          isInGame={state.gameStarted}
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
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}

    </div>
  );
};

export default GameArea;
