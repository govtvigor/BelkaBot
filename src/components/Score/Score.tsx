import React from 'react';
import nutIcon from '../../assets/nut.png'; 
import './score.scss';

interface ScoreProps {
  points: number;
}

const Score: React.FC<ScoreProps> = ({ points }) => {
  return (
    <div className="score">
      <span>{points}</span>
    </div>
  );
};

export default Score;
