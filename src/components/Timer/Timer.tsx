// src/components/Timer/Timer.tsx

import React from 'react';
import './timer.scss';

interface TimerProps {
  timeLeft: number;
  maxTime: number;
}

const Timer: React.FC<TimerProps> = ({ timeLeft, maxTime }) => {
  const percentage = (timeLeft / maxTime) * 100;

  return (
    <div className="timer">
      <div className="timer-bar">
        <div className="timer-fill" style={{ width: `${percentage}%` }}></div>
      </div>
      {/* <div className="timer-text">{timeLeft.toFixed(1)}s</div> */}
    </div>
  );
};

export default Timer;
