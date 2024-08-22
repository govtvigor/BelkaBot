import React from 'react';
import cloudSmall from '../../../assets/cloudSmall.png';
import './clouds.scss';

const CloudSmall = ({ top, left }) => {
    return (
        <img
            className={'cloud'}
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
