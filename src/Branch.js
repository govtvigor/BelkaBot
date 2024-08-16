
import React from 'react';
import branchImage from './assets/branch.png'

const Branch = ({ side, top, onClick }) => {
  const branchStyles = {
    left: { left: '29%', transform: `translateY(${top}px) scaleX(-1)` },  // Ближе к дереву слева
    right: { right: '28%', transform: `translateY(${top}px)` }, // Ближе к дереву справа
  };

  return (
    <div className={`branch ${side}`} style={{ ...branchStyles[side], position: 'absolute' }} onClick={onClick}>
      <img src={branchImage} alt={`Branch ${side}`} />
    </div>
  );
};

export default Branch;

