import React from 'react';
import squirrelImage from '../../../assets/squirt.png';
import './squirrel.scss';

const Squirrel = ({ position, isInGame }) => {
 
  const positionStyles = {
    left: isInGame ? { left: '15%', transform: `translate(-50%, -50%) scaleX(1)` } : { left: '35%',  transform: `translate(-50%, -50%) scaleX(1)` },  // В главном меню белка будет ближе к центру
    right: isInGame ? { left: '80%', transform: `translate(-50%, -50%) scaleX(-1)` } : { right: '25%', transform: `translateY(-50%) scaleX(-1)` }, // В главном меню белка будет ближе к центру
  };


  const topPosition = isInGame ? 'calc(90vh - 50px)' : '570px'; 
  const squirrelClass = isInGame ? 'squirrel in-game' : 'squirrel in-menu';

  return (
    <div className={squirrelClass} style={{ ...positionStyles[position], position: 'absolute', top: topPosition }}>
      <img src={squirrelImage} alt="Squirrel" />
    </div>
  );
};

export default Squirrel;
