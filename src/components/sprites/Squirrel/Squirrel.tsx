import React, { useEffect, useRef, useState } from 'react';
import squirrelImage from '../../../assets/squirt.png';
import './squirrel.scss';

interface SquirrelProps {
  position: 'left' | 'right';
  isInGame: boolean;
  isJumpingToFirstBranch: boolean;
  isJumping: boolean; // Додано
}

const Squirrel: React.FC<SquirrelProps> = ({ position, isInGame, isJumpingToFirstBranch, isJumping }) => {
  const prevPositionRef = useRef(position);

  useEffect(() => {
    prevPositionRef.current = position;
  }, [position]);

  const animationClass = isJumpingToFirstBranch
      ? 'jumping-to-first-branch'
      : isJumping
          ? 'jumping-between-branches'
          : '';

  // Positions
  const positionStyles = {
    left: { left: '30%', transform: 'translateX(-50%) scaleX(-1)' },
    right: { left: '70%', transform: 'translateX(-50%) scaleX(1)' },
  };

  // Determine the bottom position based on whether the squirrel is jumping to the first branch or in-game
  const bottomPosition = isJumpingToFirstBranch ? '60px' : isInGame ? '50px' : '60px';

  return (
      <div
          className={`squirrel ${position} ${animationClass}`}
          style={{
            ...positionStyles[position],
            position: 'absolute',
            bottom: bottomPosition,
            zIndex: '100',
          }}
      >
        <img src={squirrelImage} alt="Squirrel" />
      </div>
  );
};

export default Squirrel;
