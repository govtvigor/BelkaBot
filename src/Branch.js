import React from 'react';

const Branch = ({ side, onClick }) => {
  return (
    <div className={`branch ${side}`} onClick={onClick}>
      Branch {side}
    </div>
  );
};

export default Branch;
