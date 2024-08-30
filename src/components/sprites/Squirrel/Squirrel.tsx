// src/components/sprites/Squirrel/Squirrel.tsx

import React from 'react';
import squirrelImage from '../../../assets/squirt.png';
import './squirrel.scss';

interface SquirrelProps {
  position: 'left' | 'right';
  top: number;  // Додаємо властивість top для позиції по вертикалі
  isInGame: boolean;

}

const Squirrel: React.FC<SquirrelProps> = ({ position, top, isInGame }) => {
  const positionStyles = {
    left: isInGame
        ? { left: '15%', transform: `translate(-50%, -50%) scaleX(1)` }
        : { left: '35%', transform: `translate(-50%, -50%) scaleX(1)` },
    right: isInGame
        ? { left: '80%', transform: `translate(-50%, -50%) scaleX(-1)` }
        : { right: '25%', transform: `translateY(-50%) scaleX(-1)` },
  };

  const topPosition = isInGame ? `${top}px` : '570px'; // Використовуємо top з пропсів
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
