// src/components/GameArea.tsx

import React, { useState } from 'react';
import Squirrel from '../components/sprites/Squirrel/Squirrel';
import Branch from '../components/Branch/Branch';
import Score from '../components/Score/Score';
import Lives from '../components/Lives/Lives';
import Menu from '../components/Menu/Menu';
import Profile from '../components/Profile/Profile';
import CloudBig from '../components/sprites/Clouds/CloudBig';
import CloudSmall from '../components/sprites/Clouds/CloudSmall';
import ButterflyBlue from '../components/sprites/Butterflies/ButterflyBlue';
import ButterflyGreen from '../components/sprites/Butterflies/ButterflyGreen';
import mainTreeImage from '../assets/mainTree.png';
import groundTreeImage from '../assets/groundTree.png';
import startText from '../assets/startText.png';
import Timer from '../components/Timer/Timer';
import Bonus from '../components/sprites/Bonus/Bonus';
import { useGameLogic } from '../hooks/useGameLogic';
import { Branch as BranchType, Bonus as BonusType } from '../reducers/gameReducer';

const GameArea: React.FC = () => {
  const {
    state,
    handleGameStart,
    handleBranchClick,
    clouds,
    butterflies,
  } = useGameLogic();
  const [currentScreen, setCurrentScreen] = useState<'game' | 'profile'>('game');

  const handleMenuClick = (screen: 'game' | 'profile') => {
    setCurrentScreen(screen);
  };

  if (currentScreen === 'profile') {
    return <Profile onMenuClick={handleMenuClick} />;
  }

  return (
      <div className="game-container">
        <div
            className={`game-area ${state.inMenu ? 'menu-mode' : 'game-mode'}`}
            onClick={handleGameStart}
        >
          {!state.gameStarted && (
              <img className="start-text" src={startText} alt="Start Text" />
          )}

          {/* Відображення землі та кореня дерева */}
          {!state.gameStarted && (
              <div className="ground-area">
                <img src={groundTreeImage} alt="Ground Tree" className="ground-tree-image" />
              </div>
          )}

          <div className="tree-wrapper">
            <img
                src={mainTreeImage}
                alt="Main Tree"
                className="tree-image-main"
                style={{
                  transform: `translateY(${-state.scrollOffset % window.innerHeight}px)`,
                  transition: 'transform 0.5s ease-in-out',
                }}
            />
            <img
                src={mainTreeImage}
                alt="Main Tree"
                className="tree-image-main"
                style={{
                  transform: `translateY(${(-state.scrollOffset % window.innerHeight) + window.innerHeight}px)`,
                  transition: 'transform 0.5s ease-in-out',
                }}
            />
          </div>

          <Lives lives={state.lives} />
          <Timer timeLeft={state.timeLeft} />
          <Score points={state.points} />

          {/* Рендеримо хмари */}
          {clouds.map((cloud) =>
              cloud.isBigCloud ? (
                  <CloudBig key={cloud.id} top={cloud.top} left={cloud.left} />
              ) : (
                  <CloudSmall key={cloud.id} top={cloud.top} left={cloud.left} />
              )
          )}

          {/* Рендеримо метеликів */}
          {butterflies.map((butterfly) =>
              butterfly.isBlueButterfly ? (
                  <ButterflyBlue key={butterfly.id} top={butterfly.top} left={butterfly.left} />
              ) : (
                  <ButterflyGreen key={butterfly.id} top={butterfly.top} left={butterfly.left} />
              )
          )}

          <div className="branches">
            {state.branches.map((branch: BranchType, index: number) => (
                <Branch
                    key={index}
                    side={branch.side}
                    top={branch.top + state.scrollOffset}
                    onClick={() => handleBranchClick(branch.side)}
                />
            ))}

            {state.bonuses.map((bonus: BonusType, index: number) => (
                <Bonus
                    key={index}
                    top={bonus.top + state.scrollOffset - 15}
                    left={bonus.side === 'left' ? '5%' : '45%'}
                />
            ))}

              <Squirrel
                  id="squirrel"
                  position={state.squirrelSide}
                  isInGame={state.gameStarted}
                  top={state.squirrelTop + state.scrollOffset}
              />
          </div>
        </div>

        {state.inMenu && (
            <div>
              <Menu onMenuClick={handleMenuClick} />
            </div>
        )}
      </div>
  );
};

export default GameArea;
