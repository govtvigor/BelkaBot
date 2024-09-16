import React from 'react';
import branchImage from '../../assets/regular/tree2regular.png';
import './branch.scss';

interface BranchProps {
  side: 'left' | 'right';
  top: number;
  onClick: () => void;
}

const Branch: React.FC<BranchProps> = ({ side, top, onClick }) => {
  const branchStyles: React.CSSProperties = {
    position: 'absolute',
    top: `${top}px`,
    [side]: '27%',
    transform: side === 'left' ? 'scaleX(-1)' : undefined,
  };

  return (
    <div
      className="branch"
      style={branchStyles}
      onClick={onClick}
    >
      <img src={branchImage} alt={`Branch ${side}`} />
    </div>
  );
};

export default Branch;
