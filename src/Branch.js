
import React from 'react';
import branchImage from './assets/branch.png'

const Branch = ({ side, top, onClick }) => {
  const branchStyles = {
    left: { left: '20%', transform: `translateY(${top}px) scaleX(-1)` },
    right: { right: '20%', transform: `translateY(${top}px)` },
  };

  return (
    <div className={`branch ${side}`} style={{ ...branchStyles[side], position: 'absolute' }} onClick={onClick}>
      <img src={branchImage} alt={`Branch ${side}`} />
    </div>
  );
};

export default Branch;
