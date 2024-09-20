// src/components/LeaderboardBranch/LeaderboardBranch.tsx

import React from 'react';
import branchImage from '../../assets/regular/tree2regular.png';
import './leaderboardBranch.scss';

interface LeaderboardBranchProps {
    side: 'left' | 'right';
    top: number;
    onClick?: (e: React.MouseEvent) => void; // Make onClick optional
    children?: React.ReactNode; // Allow children for user info
}

const LeaderboardBranch: React.FC<LeaderboardBranchProps> = ({ side, top, onClick, children }) => {
    const branchStyles: React.CSSProperties = {
        position: 'absolute',
        top: `${top}px`,
        [side]: '15%', // Position branches on left or right
        transition: 'top 0.5s ease-out', // Smooth transition when branches appear
        zIndex: 3, // Ensure branches are above the tree
    };

    const imageStyles: React.CSSProperties = {
        transform: side === 'left' ? 'scaleX(-1)' : 'none', // Flip only the image, not the text
    };

    return (
        <div
            className="leaderboard-branch"
            style={branchStyles}
            onClick={onClick} // Attach onClick only if provided
        >
            <div className="branch-content">
                {children} {/* User info will go here */}
            </div>
            <img src={branchImage} alt={`Branch ${side}`} style={imageStyles} />

        </div>
    );
};

export default LeaderboardBranch;
