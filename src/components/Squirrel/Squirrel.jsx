import React from 'react';
import squirrelImage from '../../assets/squirt.png';
import './squirrel.scss';

const Squirrel = ({ position, top, isInGame }) => {
  const positionStyles = {
    left: { left: '30%',  transform: `translate(-50%, -50%) scaleX(1)` },
    right: { right: '20%', transform: `translate(-50%, -50%) scaleX(-1)` },
  };


  const topPosition = isInGame ? '90%' : '570px';

  return (
    <div className="squirrel" style={{ ...positionStyles[position], position: 'absolute', top: topPosition }}>
      <img src={squirrelImage} alt="Squirrel" />
    </div>
  );
};

export default Squirrel;
