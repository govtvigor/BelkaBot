import React from 'react';
import squirrelImage from './assets/squirrel.png';

const Squirrel = ({ position, top }) => {
  const positionStyles = {
    left: { left: '30%', top: `${top + 15}px`, transform: `translate(-50%, -50%) scaleX(1)` }, // Корректируем позицию белки на левой ветке
    right: { left: '70%', top: `${top + 15}px`, transform: `translate(-50%, -50%) scaleX(-1)` }, // Корректируем позицию белки на правой ветке
  };

  return (
    <div className="squirrel" style={{ ...positionStyles[position], position: 'absolute' }}>
      <img src={squirrelImage} alt="Squirrel" />
    </div>
  );
};

export default Squirrel;
