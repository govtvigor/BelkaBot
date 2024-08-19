import React from 'react';

const Timer = ({ timer }) => {
  return (
    <div className="timer">
      Time left: {timer}s
    </div>
  );
};

export default Timer;
