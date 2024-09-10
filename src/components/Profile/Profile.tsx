import React, { useState, useEffect, useContext } from "react";
import Menu from "../Menu/Menu";
import "./profile.scss";
import heartIcon from "../../assets/heart.png";
import fireIconGrey from "../../assets/fireIcon-gray.png";
import fireIconActive from "../../assets/fireIcon.png";
import { TonConnectButton, useTonConnectUI } from "@tonconnect/ui-react";
import { saveUserByChatId, updateUserWallet } from "../../client/firebaseFunctions";
import { ChatIdContext } from "../../client/App"; 
import { createInvoice } from "../../server/api/create-invoice";  // Import the API function

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

  useEffect(() => {
    if (userChatId) {
      saveUserByChatId(userChatId); 
    }
  }, [userChatId]);

  const handleGMClick = () => {
    const today = new Date().toDateString();
    const lastGMDate = localStorage.getItem("lastGMDate");
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();

    if (!isGMChecked) {
      setIsGMChecked(true);
      localStorage.setItem("lastGMDate", today);

      if (lastGMDate === yesterdayString) {
        const newStreak = gmStreak + 1;
        setGMStreak(newStreak);
        localStorage.setItem("gmStreak", newStreak.toString());
      } else {
        setGMStreak(1);
        localStorage.setItem("gmStreak", "1");
      }
    }
  };

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

  const handleBuyLives = async () => {
    const livesCost = 10;
  
    if (stars >= livesCost) {
      try {
        if (!userChatId) {
          alert("Error: Chat ID is missing. Please try again.");
          return;
        }
  
        // Call the createInvoice function
        const invoiceLink = await createInvoice(userChatId, "Extra Life", "Purchase an additional life", livesCost);
  
  
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.openInvoice(invoiceLink, (invoiceStatus) => {
          if (invoiceStatus === "paid") {
            alert("Star Payment Success!");
            setLives(lives + 1); // Increase lives upon successful payment
          }
        });
  
      } catch (error) {
        alert("Error creating invoice: " + error);
      }
    } else {
      alert("You do not have enough stars!");
    }
  };
  

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="header-leftside">
          <div className="gm" onClick={handleGMClick}>
            <div className="gm-icon-block">
              <img
                src={isGMChecked ? fireIconActive : fireIconGrey}
                alt="GM Icon"
                className="gm-icon"
              />
            </div>
            {isGMChecked ? <div>{gmStreak}</div> : <span>GM</span>}
          </div>
          <div className="profile_lives" onClick={handleBuyLives}>
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
      <Menu onMenuClick={onMenuClick} variant="profile" />
    </div>
  );
};

export default Profile;
