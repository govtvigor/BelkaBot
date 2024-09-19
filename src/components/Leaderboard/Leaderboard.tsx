// src/components/Leaderboard/Leaderboard.tsx

import React, { useEffect, useState } from "react";
import "./leaderboard.scss";
import { getLeaderboardData, LeaderboardEntry } from "../../client/firebaseFunctions"; // Ensure correct import
import Menu from "../Menu/Menu"; // Import the Menu component

interface LeaderboardProps {
  onMenuClick: (screen: 'game' | 'profile' | 'leaderboard') => void; // Pass the onMenuClick handler
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onMenuClick }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboardData();
        setLeaderboard(data);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    
      <div className="leaderboard" onClick={(e) => e.stopPropagation()}>
        
        <h2>Leaderboard</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul className="leaderboard-list">
            {leaderboard.map((entry, index) => (
              <li key={index} className="leaderboard-entry">
                <span className="rank">{index + 1}</span>
                <span className="wallet-address">
                  
                    {entry.walletAddress.slice(0, 6)}...{entry.walletAddress.slice(-4)}
                  
                </span>
                <span className="points">{entry.totalPoints}</span>
              </li>
            ))}
          </ul>
        )}
        {/* Add the Menu component at the bottom */}
        <Menu onMenuClick={onMenuClick} variant="profile" />
      </div>
    
  );
};

export default Leaderboard;
