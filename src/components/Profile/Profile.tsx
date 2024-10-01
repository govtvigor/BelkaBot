// src/components/Profile/Profile.tsx

import React, { useState, useEffect, useContext } from "react";
import Menu from "../Menu/Menu";
import "./profile.scss";
import heartIcon from "../../assets/heart.png";
import fireIconGrey from "../../assets/fireIcon-gray.png";
import fireIconActive from "../../assets/fireIcon.png";
import { TonConnectButton, useTonConnectUI } from "@tonconnect/ui-react";
import {
  saveUserByChatId,
  getUserTotalPoints,
  getUserLivesData,
  updateUserWallet,
  getUserGMData,
  getLeaderboardData,
  LeaderboardEntry 
} from "../../client/firebaseFunctions";
import { ChatIdContext } from "../../client/App";
import { handleGMClick } from "./gmStreakHandler";
import nutIcon from "../../assets/nut.png";
import SquirrelIcon from "../../assets/squirt.png";
import ShopIcon from "../../assets/shop-icon.png";
import ShopModal from "./ShopModal/ShopModal"; 
import TaskModal from "./TaskModal/TaskModal"; 
import ReferralScreen from "../ReferralScreen/ReferralScreen"; 
// import friendIcon from "../../assets/friend-icon.png"; // Import an icon for the Friends button

interface ProfileProps {
  onMenuClick: (screen: "game" | "profile" | "social") => void; // Updated to include 'leaderboard'
}

const Profile: React.FC<ProfileProps> = ({ onMenuClick }) => {
  const [totalScore, setTotalScore] = useState<number>(0);
  const [isGMChecked, setIsGMChecked] = useState<boolean>(false);
  const [gmStreak, setGMStreak] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [stars, setStars] = useState<number>(100);
  const [tonConnectUI] = useTonConnectUI();
  const userChatId = useContext(ChatIdContext);
  const [isShopModalOpen, setIsShopModalOpen] = useState<boolean>(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false); // State for TaskModal
  const [isReferralScreenOpen, setIsReferralScreenOpen] = useState<boolean>(false); // State for ReferralScreen

  // New states for leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number>(0);

  useEffect(() => {
    if (userChatId) {
      saveUserByChatId(userChatId);
      getUserLivesData(userChatId).then((livesData) => {
        if (livesData !== undefined) {
          setLives(livesData.lives);
        }
      });
      getUserGMData(userChatId)
        .then((data) => {
          setGMStreak(data.gmStreak || 0);

          const today = new Date().toDateString();
          if (data.lastGMDate === today) {
            setIsGMChecked(true);
          } else {
            setIsGMChecked(false);
          }
        })
        .catch((error) => {
          console.error("Error fetching GM data from Firebase:", error);
        });
      // Fetch total points
      getUserTotalPoints(userChatId)
        .then((points) => {
          setTotalScore(points || 0);
        })
        .catch((error) => {
          console.error("Error fetching total points from Firebase:", error);
        });

      // Fetch leaderboard data and determine user rank
      getLeaderboardData()
        .then((data) => {
          setLeaderboard(data);
          setTotalUsers(data.length);
          const sortedLeaderboard = data.sort((a, b) => b.totalPoints - a.totalPoints);
          const rank = sortedLeaderboard.findIndex(entry => entry.walletAddress === userChatId) + 1;
          setUserRank(rank > 0 ? rank : null);
        })
        .catch((error) => {
          console.error("Error fetching leaderboard data:", error);
        });
    }
  }, [userChatId]);

  useEffect(() => {
    if (tonConnectUI) {
      tonConnectUI.onStatusChange(async (wallet) => {
        if (wallet) {
          const walletAddress = wallet.account.address.toString();
          if (userChatId) {
            await updateUserWallet(userChatId, walletAddress);
          } else {
            console.error("Chat ID is null, cannot save wallet address.");
          }
        }
      });
    }
  }, [tonConnectUI, userChatId]);

  const handleGMClickAction = () => {
    handleGMClick(
      isGMChecked,
      setIsGMChecked,
      gmStreak,
      setGMStreak,
      userChatId
    );
  };

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="header-leftside">
          <div className="gm" onClick={handleGMClickAction}>
            <div className="gm-icon-block">
              <img
                src={isGMChecked ? fireIconActive : fireIconGrey}
                alt="GM Icon"
                className="gm-icon"
              />
            </div>
            {isGMChecked ? <div>{gmStreak}</div> : <span>GM</span>}
          </div>
        </div>
        <div className="crypto-wallet">
          <TonConnectButton />
        </div>
      </div>

      <div className="profile-content">
        <div className="total-points-section">
          <div className="total-score-block">
            <p>{totalScore}</p>
            <img src={nutIcon} alt="Nut Icon" className="nut-icon-profile" />
          </div>
        </div>

        {/* Friends Section */}
        <div className="friend-section">
          <button
            className="friend-button"
            onClick={() => setIsReferralScreenOpen(true)}
          >
            {/* <img src={friendIcon} alt="Friends" className="friend-icon" /> */}
            Friends
          </button>
        </div>

        {/* Shop Section */}
        <div className="shop-section" onClick={() => setIsShopModalOpen(true)}>
          <img
            src={ShopIcon}
            alt="shop-icon"
            className="shop-section-icon"
          />
        </div>

        {/* New Leaderboard Rank Section */}
        {userRank !== null && (
          <div className="leaderboard-rank-section">
            <div className="rank-text">
              {userRank === 1
                ? "You're the top squirrel! 🏆"
                : `Your place is #${userRank} among ${totalUsers} squirrels!`}
            </div>
          </div>
        )}
      </div>

      <div className="squirrel-profile">
        <img
          src={SquirrelIcon}
          alt="squirrel"
          className="squirrel-profile-icon"
        />
      </div>
      <Menu onMenuClick={onMenuClick} variant="profile" />

      {isShopModalOpen && (
        <ShopModal
          onClose={() => setIsShopModalOpen(false)}
          userChatId={userChatId}
          stars={stars}
          lives={lives}
          setLives={setLives}
        />
      )}
      {isTaskModalOpen && (
        <TaskModal onClose={() => setIsTaskModalOpen(false)} />
      )}
      {isReferralScreenOpen && (
        <ReferralScreen onClose={() => setIsReferralScreenOpen(false)} />
      )}
    </div>
  );
};

export default Profile;
