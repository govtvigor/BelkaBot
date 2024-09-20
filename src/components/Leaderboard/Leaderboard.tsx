// src/components/Leaderboard/Leaderboard.tsx

import React, { useEffect, useState } from "react";
import "./leaderboard.scss";
import { getLeaderboardData, LeaderboardEntry } from "../../client/firebaseFunctions";
import Menu from "../Menu/Menu";
import LeaderboardBranch from "../LeaderboardBranch/LeaderboardBranch"; // New component for leaderboard branches
import groundTreeImage from "../../assets/groundTree.png";
import mainTreeImage from "../../assets/mainTree.png";
import crownTreeImage from "../../assets/crownTree.png";

interface LeaderboardProps {
  onMenuClick: (screen: 'game' | 'profile' | 'leaderboard') => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onMenuClick }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [visibleEntries, setVisibleEntries] = useState<number>(0); // For animation
  const [currentPage, setCurrentPage] = useState<number>(0); // Pagination

  const entriesPerPage = 5;

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

  useEffect(() => {
    if (!loading) {
      // Start the animation by revealing entries one by one
      let count = 0;
      const maxVisible = Math.min(entriesPerPage, leaderboard.length - currentPage * entriesPerPage);
      const interval = setInterval(() => {
        count += 1;
        setVisibleEntries(count);
        if (count >= maxVisible) {
          clearInterval(interval);
        }
      }, 300); // Adjust the interval as needed

      return () => clearInterval(interval);
    }
  }, [loading, leaderboard, currentPage]);

  // Calculate the current page's entries
  const startIdx = currentPage * entriesPerPage;
  const currentEntries = leaderboard.slice(startIdx, startIdx + entriesPerPage);

  const hasPrevious = currentPage > 0;
  const hasNext = startIdx + entriesPerPage < leaderboard.length;

  const handlePrevious = () => {
    if (hasPrevious) {
      setVisibleEntries(0);
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setVisibleEntries(0);
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="leaderboard" onClick={(e) => e.stopPropagation()}>
      {/* <div className="title">
        <h2>Leaderboard</h2>
      </div> */}
      {loading ? (
        <p>Loading...</p>
      ) : leaderboard.length === 0 ? (
        <p>No entries yet!</p>
      ) : (
        <div className="leaderboard-content">
          {/* Tree Structure */}
          <div className="tree-container-lead">
            {/* Ground Image */}
            <div className="ground-wrapper-lead">
              <img src={groundTreeImage} alt="Ground" />
            </div>
            {/* Main Tree */}
            <div className="tree-trunk-lead">
              <img src={mainTreeImage} alt="Main Tree" />
            </div>
            <div className="tree-crown-lead">
              {/* <img src={crownTreeImage} alt="Crown Tree" /> */}
            </div>
            {/* Branches */}
            <div className="branches-container">
              {currentEntries.slice(0, visibleEntries).map((entry, index) => {
                const side = index % 2 === 0 ? 'left' : 'right'; // Alternate sides
                return (
                  <LeaderboardBranch
                    key={entry.walletAddress}
                    side={side}
                    top={10 + index * 80} // Adjust top position as needed
                  >
                    <div className="rank">{startIdx + index + 1}</div>
                    <div className="wallet-address">
                    {entry.walletAddress.slice(0, 4)}...{entry.walletAddress.slice(-4)}
                    </div>
                    <div className="points">
                    {entry.totalPoints}</div>
                  </LeaderboardBranch>
                );
              })}
            </div>
          </div>
          {/* Navigation Arrows */}
          <div className="navigation-arrows">
            {hasPrevious && (
              <button
                className="arrow-button prev"
                onClick={handlePrevious}
                aria-label="Previous Page"
              >
                &#8592;
              </button>
            )}
            {hasNext && (
              <button
                className="arrow-button next"
                onClick={handleNext}
                aria-label="Next Page"
              >
                &#8594;
              </button>
            )}
          </div>
        </div>
      )}
      {/* Menu Component */}
      <Menu onMenuClick={onMenuClick} variant="profile" />
    </div>
  );
};

export default Leaderboard;
