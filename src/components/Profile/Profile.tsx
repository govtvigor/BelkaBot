import React, { useState, useEffect, useContext } from "react";
import Menu from "../Menu/Menu";
import "./profile.scss";
import { useTranslation } from 'react-i18next';
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
  LeaderboardEntry,
  getUserData
} from "../../client/firebaseFunctions";
import { ChatIdContext } from "../../client/App";
import { handleGMClick } from "./gmStreakHandler";
import nutIcon from "../../assets/nut.png";
import SquirrelIcon from "../../assets/squirt.png";
import ShopIcon from "../../assets/shop-icon.png";
import ShopModal from "./ShopModal/ShopModal"; 
import TaskModal from "./TaskModal/TaskModal"; 
import ReferralScreen from "../ReferralScreen/ReferralScreen"; 

interface ProfileProps {
  onMenuClick: (screen: "game" | "profile" | "social") => void;
}

const Profile: React.FC<ProfileProps> = ({ onMenuClick }) => {
  const { t } = useTranslation(); // Initialize the translation function
  const [totalScore, setTotalScore] = useState<number>(0);
  const [isGMChecked, setIsGMChecked] = useState<boolean>(false);
  const [gmStreak, setGMStreak] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [stars, setStars] = useState<number>(100);
  const [tonConnectUI] = useTonConnectUI();
  const userChatId = useContext(ChatIdContext);
  const [isShopModalOpen, setIsShopModalOpen] = useState<boolean>(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [isReferralScreenOpen, setIsReferralScreenOpen] = useState<boolean>(false);

  // New states for leaderboard and username
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [username, setUsername] = useState<string>(''); // Added username state

  // Fetch user data and leaderboard
  useEffect(() => {
    if (userChatId) {
      saveUserByChatId(userChatId);
      
      // Fetch user lives
      getUserLivesData(userChatId).then((livesData) => {
        if (livesData !== undefined) {
          setLives(livesData.lives);
        }
      });

      // Fetch GM data
      getUserGMData(userChatId)
        .then((data) => {
          setGMStreak(data.gmStreak || 0);
          const today = new Date().toDateString();
          setIsGMChecked(data.lastGMDate === today);
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

      // Fetch leaderboard data
      getLeaderboardData()
        .then((data) => {
          setLeaderboard(data);
          setTotalUsers(data.length);
          // Compute rank
          const rank = data.findIndex(entry => entry.chatId === userChatId) + 1;
          setUserRank(rank > 0 ? rank : null);
        })
        .catch((error) => {
          console.error("Error fetching leaderboard data:", error);
        });

      // Fetch username
      getUserData(userChatId)
        .then((data) => {
          setUsername(data?.username || '');
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, [userChatId]);

  // Update wallet address on status change
  useEffect(() => {
    if (tonConnectUI) {
      tonConnectUI.onStatusChange(async (wallet) => {
        if (wallet) {
          const walletAddr = wallet.account.address.toString();
          if (userChatId) {
            await updateUserWallet(userChatId, walletAddr);
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
            {t('profile.friends')}
          </button>
        </div>

        {/* Shop Section */}
        <div className="shop-section" onClick={() => setIsShopModalOpen(true)}>
          <img
            src={ShopIcon}
            alt="shop-icon"
            className="shop-section-icon"
          />
          {/* <p>{t('profile.shop')}</p> */}
        </div>

        {/* Leaderboard Rank Section */}
        {userRank !== null && (
          <div className="leaderboard-rank-section">
            <div className="rank-text">
              {userRank === 1 ? (
                t('profile.top_rank')
              ) : (
                `@${username}, ${t('profile.rank')}: #${userRank}`
              )}
            </div>
          </div>
        )}

        {/* Share Link Section */}
        <div className="share-link-section">
          <p>{t('profile.share_link')}</p>
          <button className="share-button">{t('profile.share_button')}</button>
        </div>

        {/* Total Referrals and Points Earned Section */}
        <div className="referral-stats-section">
          <div className="total-referrals">
            <p>{t('profile.total_refs')}</p>
          </div>
          <div className="points-earned">
            <p>{t('profile.points_earned_ref')}</p>
          </div>
        </div>

        {/* Referred Friends Section */}
        <div className="referred-friends-section">
          <p>{t('profile.ref_friends')}</p>
          <p>{t('profile.no_refs')}</p>
        </div>
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
