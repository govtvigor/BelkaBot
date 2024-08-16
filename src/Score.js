import React from 'react';
import nutIcon from './assets/nut.png'; // Иконка ореха

const Score = ({ points }) => {
  return (
    <div className="score">
      <img src={nutIcon} alt="Nut Icon" className="nut-icon" />
      <span>{points}</span>
    </div>
  );
};

export default Score;
