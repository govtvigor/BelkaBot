
import React from 'react';
import squirrelImage from './assets/squirrel.png'

const Squirrel = ({ position, top }) => {
  const positionStyles = {
    left: { left: '35%', transform: `translateY(${top}px)` }, // Позиционирование слева ближе к дереву
    right: { left: '65%', transform: `translateY(${top}px)` }, // Позиционирование справа ближе к дереву
  };

  return (
    <div className="squirrel" style={{ ...positionStyles[position], position: 'absolute' }}>
      <img src={squirrelImage} alt="Squirrel" />
    </div>
  );
};

export default Squirrel;

