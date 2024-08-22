import React from 'react';
import cloudBig from '../../../assets/cloudBig.png';
import './clouds.scss';

const CloudBig = ({ top, left }) => {
    return (
        <img
            className={'cloud'}
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
