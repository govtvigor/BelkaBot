// src/components/sprites/Bonus/Bonus.tsx

import React from 'react';
import bonusImage from '../../../assets/bonus.png';
import './bonus.scss';

// Define the props interface for the Bonus component
interface BonusProps {
  top: number;
  left: string | number;
}

const Bonus: React.FC<BonusProps> = ({ top, left }) => {
  return (
    <div className="bonus" style={{ top: `${top}px`, left }}>
      <img src={bonusImage} alt="Bonus" />
    </div>
  );
};

export default Bonus;
