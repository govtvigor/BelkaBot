import React, { useState, useEffect, useContext } from "react";
import Menu from "../Menu/Menu";
import "./profile.scss";
import heartIcon from "../../assets/heart.png";
import fireIconGrey from "../../assets/fireIcon-gray.png";
import fireIconActive from "../../assets/fireIcon.png";
import { TonConnectButton, useTonConnectUI } from "@tonconnect/ui-react";
import { saveUserByChatId, getUserTotalPoints, getUserLivesData, updateUserWallet, getUserGMData } from "../../client/firebaseFunctions";
import { ChatIdContext } from "../../client/App";
import { handleGMClick } from "./gmStreakHandler";
import { handleBuyLives } from "./paymentHandler";
import { getUserAchievements } from "../../client/firebaseFunctions";
import { achievements as allAchievements } from "../../constants/achievements";

interface ProfileProps {
  onMenuClick: (screen: "game" | "profile") => void;
}

const Profile: React.FC<ProfileProps> = ({ onMenuClick }) => {
  const [totalScore, setTotalScore] = useState<number>(0);
  const [isGMChecked, setIsGMChecked] = useState<boolean>(false);
  const [gmStreak, setGMStreak] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [stars, setStars] = useState<number>(100);
  const [tonConnectUI] = useTonConnectUI();
  const userChatId = useContext(ChatIdContext);
  const [userAchievements, setUserAchievements] = useState<string[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);

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
      getUserTotalPoints(userChatId).then((points) => {
        setTotalScore(points || 0);
      }).catch((error) => {
        console.error("Error fetching total points from Firebase:", error);
      });
      getUserAchievements(userChatId).then((achievements) => setUnlockedAchievements(achievements || []));
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
    handleGMClick(isGMChecked, setIsGMChecked, gmStreak, setGMStreak, userChatId);
  };

  const handleBuyLivesAction = () => {
    handleBuyLives(stars, lives, setLives, userChatId);
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
          <div className="profile_lives" onClick={handleBuyLivesAction}>
            <div className="lives-icon-block">
              <img src={heartIcon} alt="lives" className="profile-lives-icon" />
            </div>
            <div className="lives-amount-block">{lives}+</div>
          </div>
        </div>
        <div className="crypto-wallet">
          <TonConnectButton />
        </div>
      </div>
      <div className="total-points-section">
        <h3>Total Nut Points</h3>
        <p>{totalScore}</p>
      </div>
      <div className="achievements-section">
        <h3>Achievements</h3>
        <div className="achievements-grid">
          {allAchievements.map((achievement) => (
            <div key={achievement.id} className="achievement">
              <img
                src={achievement.icon}
                alt={achievement.name}
                className={`achievement-icon ${unlockedAchievements.includes(achievement.id) ? '' : 'locked'
                  }`}
              />
              <p>{achievement.name}</p>
            </div>
          ))}
        </div>
      </div>
      <Menu onMenuClick={onMenuClick} variant="profile" />
    </div>
  );
};

export default Profile;
