import React from 'react';

const Squirrel = ({ position }) => {
  const positionStyles = {
    center: { transform: 'translate(0, 0)' },
    left: { transform: 'translate(-100px, -50px)' }, // Прыжок на левую ветку
    right: { transform: 'translate(100px, -50px)' }, // Прыжок на правую ветку
  };

  return (
    <div className="squirrel" style={{ ...positionStyles[position], transition: 'transform 0.5s ease' }}>
      <img src="./assets/squirrel.png" alt="Squirrel" />
    </div>
  );
};

export default Squirrel;
