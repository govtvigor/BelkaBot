// src/components/Timer/Timer.tsx

import React from 'react';
import './timer.scss';

// Define the props interface for the Timer component
interface TimerProps {
  timeLeft: number;
}

const Timer: React.FC<TimerProps> = ({ timeLeft }) => {
  return (
    <div className="timer">
      <span className="timer-text">{Math.floor(timeLeft)}s</span>
    </div>
  );
};

export default Timer;
