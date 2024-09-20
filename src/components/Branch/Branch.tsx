// src/components/Branch/Branch.tsx

import React from 'react';
import branchImage from '../../assets/pixil1.png';
import './branch.scss';

interface BranchProps {
  side: 'left' | 'right';
  top: number;
  onClick?: (e: React.MouseEvent) => void; // Make onClick optional
  children?: React.ReactNode; // Allow children
}

const Branch: React.FC<BranchProps> = ({ side, top, onClick, children }) => {
  const branchStyles: React.CSSProperties = {
    position: 'absolute',
    top: `${top}px`,
    [side]: '22%', // Position branches on left or right
    transform: side === 'left' ? 'scaleX(-1)' : 'scaleX(1)', // Flip image for left side
    transition: 'top 0.5s ease-out', // Smooth transition when branches appear
    zIndex: 3, // Ensure branches are above the tree
  };

  return (
    <div
      className="branch"
      style={branchStyles}
      onClick={onClick} // Attach onClick only if provided
    >
      <div className="branch-content">
        {children}
      </div>
      <img src={branchImage} alt={`Branch ${side}`} />
      
    </div>
  );
};

export default Branch;
