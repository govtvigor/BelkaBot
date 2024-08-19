import React from 'react';
import heartIcon from '../../assets/heart.png';
import './lives.scss';

const Lives = ({ lives }) => {
  return (
    <div className="lives">
      <img src={heartIcon} alt="Heart Icon" className="heart-icon" />
      <span>{lives}</span>
    </div>
  );
};

export default Lives;
