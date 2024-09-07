import React from 'react';
import butterflyGreen from '../../../assets/butterfly.png';
import './butterflies.scss';

interface ButterflyGreenProps {
  top: number;
  left: number;
}

const ButterflyGreen: React.FC<ButterflyGreenProps> = ({ top, left }) => {
  return (
    <div className="butterfly-small" style={{ top: `${top}px`, left: `${left}px` }}>
      <img className="butterfly-img" src={butterflyGreen} alt="Big Butterfly" />
    </div>
  );
};

export default ButterflyGreen;
