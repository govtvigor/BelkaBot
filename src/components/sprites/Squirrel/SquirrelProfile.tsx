import React from 'react';
import squirrelImage from '../../../assets/squirt.png';
import './squirrel.scss';

interface SquirrelProfileProps {
  position?: 'left' | 'right';
  isInGame?: boolean;
}

const SquirrelProfile: React.FC<SquirrelProfileProps> = ({  }) => {
 

  return (
    <div
      className={`squirrel`}
    >
      <img src={squirrelImage} alt="Squirrel" />
    </div>
  );
};

export default SquirrelProfile;
