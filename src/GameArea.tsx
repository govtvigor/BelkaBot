// src/components/GameArea.tsx

import React from 'react';
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
import { useGameLogic } from './hooks/useGameLogic';
import { useClouds } from './hooks/useClouds';
import { useButterflies } from './hooks/useButterflies';
import { Branch as BranchType, Bonus as BonusType } from './reducers/gameReducer';

const GameArea: React.FC = () => {
  const { state, handleGameStart, handleBranchClick, resetGame } = useGameLogic();
  const { clouds } = useClouds(state.gameStarted);
  const { butterflies } = useButterflies(state.gameStarted);

  return (
    <div className="game-container">
      <div className={`game-area ${state.inMenu ? 'menu-mode' : 'game-mode'}`} onClick={handleGameStart}>
        {!state.gameStarted && (
          <img className="start-text" src={startText} alt="Start Text" />
        )}

        {/* Логика отображения дерева и фона */}
        <div className="tree-wrapper">
          {/* Восстанавливаем нижнюю часть дерева (ground tree) в главном меню */}
          {!state.gameStarted && (
            <img
              src={groundTreeImage}
              alt="Ground Tree"
              className="tree-image"
              style={{
                transform: `translateY(${state.scrollOffset}px)`,
                transition: 'transform 2s ease-out',
                zIndex: state.gameStarted ? -1 : 1,
              }}
            />
          )}

          {/* Основное дерево для бесконечного эффекта */}
          <img
            src={mainTreeImage}
            alt="Main Tree"
            className="tree-image-main"
            style={{
              transform: `translateY(${state.scrollOffset % window.innerHeight}px)`, // Используем модуль для бесконечного эффекта
              transition: 'transform 0.2s ease-out',
            }}
          />
          <img
            src={mainTreeImage}
            alt="Main Tree"
            className="tree-image-main"
            style={{
              transform: `translateY(${(state.scrollOffset % window.innerHeight) - window.innerHeight}px)`, // Дублируем для бесконечного дерева
              transition: 'transform 0.2s ease-out',
            }}
          />
        </div>

        <Lives lives={state.lives} />
        <Timer timeLeft={state.timeLeft} />
        <Score points={state.points} />

        {/* Отображение облаков и бабочек */}
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

        {/* Отображение веток */}
        <div className="branches">
          {state.branches.map((branch: BranchType, index: number) => (
            <Branch
              key={index}
              side={branch.side}
              top={branch.top + state.scrollOffset} // Смещение веток вниз
              onClick={() => handleBranchClick(branch.side, branch.top)}
            />
          ))}

          {/* Отображение бонусов */}
          {state.bonuses.map((bonus: BonusType, index: number) => (
            <Bonus
              key={index}
              top={bonus.top + state.scrollOffset - 15}
              left={bonus.side === 'left' ? '5%' : '45%'}
            />
          ))}

          <Squirrel position={state.squirrelSide} isInGame={state.gameStarted}  top={state.squirrelTop}/>
        </div>
      </div>

      {state.inMenu && <Menu onClick={handleGameStart} />}
    </div>
  );
};

export default GameArea;
