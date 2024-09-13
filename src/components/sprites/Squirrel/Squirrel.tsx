import React from 'react';
import squirrelImage from '../../../assets/squirt.png';
import './squirrel.scss';

interface SquirrelProps {
  position: 'left' | 'right';
  isInGame: boolean;
}

const Squirrel: React.FC<SquirrelProps> = ({ position, isInGame }) => {
  const positionStyles = {
    left: { left: '35%', transform: 'translateX(-50%) scaleX(1)' },
    right: { left: '70%', transform: 'translateX(-50%) scaleX(-1)' },
  };

  return (
    <div
      className={`squirrel ${position}`}
      style={{
        ...positionStyles[position],
        position: 'absolute',
        bottom: '60px', // Fixed distance from the bottom
        transition: 'transform 0.2s ease-in-out',
        zIndex: '100',
      }}
    >
      <img src={squirrelImage} alt="Squirrel" />
    </div>
  );
};

export default Squirrel;
