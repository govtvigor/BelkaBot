
import React from 'react';
import squirrelImage from './assets/squirrel.png'

const Squirrel = ({ position, top }) => {
  const positionStyles = {
    left: { left: '30%', top: `${top}px`, transform: `translate(-50%, -50%)` },
    right: { left: '70%', top: `${top}px`, transform: `translate(-50%, -50%)` },
  };

  return (
    <div className="squirrel" style={{ ...positionStyles[position], position: 'absolute' }}>
      <img src={squirrelImage} alt="Squirrel" />
    </div>
  );
};

export default Squirrel;
