import React from 'react';
import squirrelImage from './assets/squirrel.png';

const Squirrel = ({ position }) => {
  const positionStyles = {
    center: { transform: 'translate(0, 0)' },
    left: { transform: 'translate(-100px, -50px)' }, // Прыжок на левую ветку
    right: { transform: 'translate(100px, -50px)' }, // Прыжок на правую ветку
  };

  return (
    <div className="squirrel" style={{ ...positionStyles[position], transition: 'transform 0.5s ease' }}>
      <img src={squirrelImage} alt="Squirrel" />
    </div>
  );
};

export default Squirrel;
