// src/components/sprites/Clouds/CloudSmall.tsx

import React from 'react';
import cloudSmall from '../../../assets/cloudSmall.png';
import './clouds.scss';

// Define the props interface for the CloudSmall component
interface CloudSmallProps {
  top: number;
  left: number;
}

const CloudSmall: React.FC<CloudSmallProps> = ({ top, left }) => {
  return (
    <img
      className="cloud"
      src={cloudSmall}
      alt="Cloud Small"
      style={{
        top: `${top}px`,
        left: `${left}px`,
        width: '100px',
      }}
    />
  );
};

export default CloudSmall;
