// src/components/sprites/Clouds/CloudBig.tsx

import React from 'react';
import cloudBig from '../../../assets/cloudBig.png';
import './clouds.scss';

// Define the props interface for the CloudBig component
interface CloudBigProps {
  top: number;
  left: number;
}

const CloudBig: React.FC<CloudBigProps> = ({ top, left }) => {
  return (
    <img
      className="cloud"
      src={cloudBig}
      alt="Cloud Big"
      style={{
        top: `${top}px`,
        left: `${left}px`,
        width: '150px',
      }}
    />
  );
};

export default CloudBig;
