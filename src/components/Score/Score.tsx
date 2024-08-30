// src/components/Score/Score.tsx

import React from 'react';
import nutIcon from '../../assets/nut.png'; // Nut icon
import './score.scss';

// Define the props interface for the Score component
interface ScoreProps {
  points: number;
}

const Score: React.FC<ScoreProps> = ({ points }) => {
  return (
    <div className="score">
      <img src={nutIcon} alt="Nut Icon" className="nut-icon" />
      <span>{points}</span>
    </div>
  );
};

export default Score;
