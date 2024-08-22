import React from 'react';
import butterflyBlue from '../../../assets/buttefly2.png';
import './butterflies.scss';

const ButterflyBlue = ({ top, left }) => {
    return (
        <div className="butterfly-big" style={{ top: `${top}px`, left: `${left}px` }}>
            <img className="butterfly-img" src={butterflyBlue} alt="Small Butterfly" />
        </div>
    );
};

export default ButterflyBlue;
