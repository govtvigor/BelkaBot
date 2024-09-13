// src/components/sprites/Squirrel/Squirrel.tsx

import React from 'react';
import squirrelImage from '../../../assets/squirt.png';
import './squirrel.scss';

interface SquirrelProps extends React.HTMLAttributes<HTMLDivElement> {
  position: 'left' | 'right';
  top: number;
  isInGame: boolean;
}

const Squirrel: React.FC<SquirrelProps> = ({ id, position, top, isInGame, ...rest }) => {
  const positionStyles = {
    left: { left: '15%', transform: `translate(-50%, -50%) scaleX(1)` },
    right: { left: '80%', transform: `translate(-50%, -50%) scaleX(-1)` },
  };

  return (
      <div
          id={id}
          {...rest}
          className={`squirrel ${position}`}
          style={{ ...positionStyles[position], position: 'absolute', top: `${top}px` }}
      >
        <img src={squirrelImage} alt="Squirrel" />
      </div>
  );
};

export default Squirrel;
