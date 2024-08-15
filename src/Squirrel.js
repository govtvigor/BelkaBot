import React from 'react';

const Squirrel = ({ position }) => {
  return (
    <div className={`squirrel ${position}`}>
      🐿️
    </div>
  );
};

export default Squirrel;
