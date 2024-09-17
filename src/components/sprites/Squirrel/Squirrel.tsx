// src/components/sprites/Squirrel/Squirrel.tsx

import React, { useEffect, useRef, useState } from 'react';
import squirrelImage from '../../../assets/squirt.png';
import './squirrel.scss';

interface SquirrelProps {
    position: 'left' | 'right';
    isInGame: boolean;
    isJumpingToFirstBranch: boolean;
}

const Squirrel: React.FC<SquirrelProps> = ({ position, isInGame, isJumpingToFirstBranch }) => {
    const [isJumping, setIsJumping] = useState(false);
    const prevPositionRef = useRef(position);

    useEffect(() => {
        if (isInGame && prevPositionRef.current !== position) {
            setIsJumping(true);

            const animationDuration = 500;
            const timer = setTimeout(() => {
                setIsJumping(false);
            }, animationDuration);

            prevPositionRef.current = position;

            return () => clearTimeout(timer);
        }
    }, [position, isInGame]);

    const animationClass = isJumpingToFirstBranch
        ? 'jumping-to-first-branch'
        : isJumping
            ? 'jumping-between-branches'
            : '';

    // Positions
    const positionStyles = {
        left: { left: '30%', transform: 'translateX(-50%) scaleX(-1)' },
        right: { left: '70%', transform: 'translateX(-50%) scaleX(1)' },
    };

    // Determine the bottom position based on whether the squirrel is jumping to the first branch or in-game
    const bottomPosition = isJumpingToFirstBranch ? '60px' : isInGame ? '120px' : '60px'; // Adjusted

    return (
        <div
            className={`squirrel ${position} ${animationClass}`}
            style={{
                ...positionStyles[position],
                position: 'absolute',
                bottom: bottomPosition,
                zIndex: '100',
            }}
        >
            <img src={squirrelImage} alt="Squirrel" />
        </div>
    );
};

export default Squirrel;
