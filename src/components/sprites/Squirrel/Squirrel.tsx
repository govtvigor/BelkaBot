import React from 'react';
import squirrelImage from '../../../assets/squirt.png';
import './squirrel.scss';

interface SquirrelProps {
  position: 'left' | 'right';
  top: number;
  isInGame: boolean;
}

const Squirrel: React.FC<SquirrelProps> = ({ position, top, isInGame }) => {
  const positionStyles = {
    left: { left: '15%', transform: `translate(-50%, -50%) scaleX(1)` },
    right: { left: '80%', transform: `translate(-50%, -50%) scaleX(-1)` },
  };

  return (
      <div
          className={`squirrel ${position}`}
          style={{ ...positionStyles[position], position: 'absolute', top: `${top}px` }}
      >
        <img src={squirrelImage} alt="Squirrel" />
      </div>
  );
};

export default Squirrel;
