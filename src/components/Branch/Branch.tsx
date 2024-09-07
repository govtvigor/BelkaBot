import React from 'react';
import branchImage from '../../assets/branch.png';
import './branch.scss';

interface BranchProps {
  side: 'left' | 'right';
  top: number;
  onClick: () => void;
}

const Branch: React.FC<BranchProps> = ({ side, top, onClick }) => {

  const branchStyles: Record<'left' | 'right', React.CSSProperties> = {
    left: { left: '25%', transform: `translateY(${top}px) scaleX(-1)` },
    right: { right: '25%', transform: `translateY(${top}px)` },
  };

  return (
    <div
      className={`branch ${side}`}
      style={{ ...branchStyles[side], position: 'absolute' }}
      onClick={onClick}
    >
      <img src={branchImage} alt={`Branch ${side}`} />
    </div>
  );
};

export default Branch;
