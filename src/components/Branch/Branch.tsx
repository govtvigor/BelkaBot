// src/components/Branch/Branch.tsx

import React from 'react';
import branchImage from '../../assets/regular/tree2regular.png';
import './branch.scss';

interface BranchProps {
  side: 'left' | 'right';
  top: number;
  onClick?: (e: React.MouseEvent) => void; // Make onClick optional
}

const Branch: React.FC<BranchProps> = ({ side, top, onClick }) => {
  const branchStyles: React.CSSProperties = {
    position: 'absolute',
    top: `${top}px`,
    [side]: '27%', // Position branches on left or right
    transform: side === 'left' ? 'scaleX(-1)' : 'scaleX(1)', // Flip image for left side
    transition: 'top 0.5s ease-out', // Smooth transition when branches appear
  };

  return (
    <div
      className="branch"
      style={branchStyles}
      onClick={onClick} // Attach onClick only if provided
    >
      <img src={branchImage} alt={`Branch ${side}`} />
    </div>
  );
};

export default Branch;
