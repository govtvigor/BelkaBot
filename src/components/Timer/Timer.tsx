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
      <div className="loading-icon">✦</div> {/* Simple pixel-style icon */}
      <div className="timer-bar">
        <div className="timer-fill" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

export default Timer;
