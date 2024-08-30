// src/components/sprites/Squirrel/Squirrel.tsx

import React from 'react';
import squirrelImage from '../../../assets/squirt.png';
import './squirrel.scss';

// Define the props interface for the Squirrel component
interface SquirrelProps {
  position: 'left' | 'right';
  isInGame: boolean;
}

const Squirrel: React.FC<SquirrelProps> = ({ position, isInGame }) => {
  const positionStyles = {
    left: isInGame
      ? { left: '15%', transform: `translate(-50%, -50%) scaleX(1)` }
      : { left: '35%', transform: `translate(-50%, -50%) scaleX(1)` }, // Centered in menu mode
    right: isInGame
      ? { left: '80%', transform: `translate(-50%, -50%) scaleX(-1)` }
      : { right: '25%', transform: `translateY(-50%) scaleX(-1)` }, // Centered in menu mode
  };

  const topPosition = isInGame ? 'calc(90vh - 50px)' : '570px'; 
  const squirrelClass = isInGame ? 'squirrel in-game' : 'squirrel in-menu';

  return (
    <div
      className={squirrelClass}
      style={{ ...positionStyles[position], position: 'absolute', top: topPosition }}
    >
      <img src={squirrelImage} alt="Squirrel" />
    </div>
  );
};

export default Squirrel;
