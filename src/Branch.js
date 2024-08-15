import React from 'react';
import branchImage from './assets/branch.png';

const Branch = ({ side, onClick }) => {
  return (
    <div className={`branch ${side}`} onClick={onClick}>
      <img
        src={branchImage}
        alt={`Branch ${side}`}
        style={{ transform: side === 'left' ? 'scaleX(-1)' : 'scaleX(1)' }} 
      />
    </div>
  );
};

export default Branch;
