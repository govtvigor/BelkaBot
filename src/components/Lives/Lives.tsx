import React from 'react';
import heartIcon from '../../assets/heart.png';
import './lives.scss';

// Define the props interface for the component
interface LivesProps {
  lives: number;
}

const Lives: React.FC<LivesProps> = ({ lives }) => {
  return (
    <div className="lives">
      <img src={heartIcon} alt="Heart Icon" className="heart-icon" />
      <span>{lives}</span>
    </div>
  );
};

export default Lives;
