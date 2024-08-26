import React from 'react';
import './timer.scss';

const Timer = ({ timeLeft }) => {
  return (
    <div className="timer">
      <span className="timer-text">{timeLeft}s</span>
    </div>
  );
};

export default Timer;
