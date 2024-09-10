import React, { useState, useEffect, useContext } from "react";
import Menu from "../Menu/Menu";
import "./profile.scss";
import heartIcon from "../../assets/heart.png";
import fireIconGrey from "../../assets/fireIcon-gray.png";
import fireIconActive from "../../assets/fireIcon.png";
import { TonConnectButton, useTonConnectUI } from "@tonconnect/ui-react";
import { saveUserByChatId, updateUserWallet, getUserLives, updateUserLives, updateUserGMStreak } from "../../client/firebaseFunctions";
import { ChatIdContext } from "../../client/App"; 
import { createInvoice } from "../../server/api/create-invoice";  // Import the API function

interface ProfileProps {
  onMenuClick: (screen: "game" | "profile") => void;
}

const Profile: React.FC<ProfileProps> = ({ onMenuClick }) => {
  const [totalScore, setTotalScore] = useState<number>(0);
  const [isGMChecked, setIsGMChecked] = useState<boolean>(false);
  const [gmStreak, setGMStreak] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);  // Initial state for lives
  const [stars, setStars] = useState<number>(100);
  const [tonConnectUI] = useTonConnectUI();
  const userChatId = useContext(ChatIdContext);

  // Fetch and save user by Chat ID on component load
  useEffect(() => {
    if (userChatId) {
      saveUserByChatId(userChatId);
      
      // Fetch lives from Firebase
      getUserLives(userChatId).then((fetchedLives) => {
        if (fetchedLives !== undefined) {
          setLives(fetchedLives);
        }
      }).catch((error) => {
        console.error("Error fetching lives from Firebase:", error);
      });
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
  
      let newStreak;
      if (lastGMDate === yesterdayString) {
        newStreak = gmStreak + 1;
        setGMStreak(newStreak);
        localStorage.setItem("gmStreak", newStreak.toString());
      } else {
        newStreak = 1;
        setGMStreak(1);
        localStorage.setItem("gmStreak", "1");
      }
  
      // Save GM streak to Firebase
      if (userChatId) {
        updateUserGMStreak(userChatId, newStreak).catch((error) => {
          console.error("Error saving GM streak to Firebase:", error);
        });
      }
    }
  };

  // Handle wallet connection with TonConnect and save wallet address
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

  // Handle buying lives via invoice and save the updated lives to Firebase
  const handleBuyLives = async () => {
    const livesCost = 1;  // Define the cost of lives
  
    if (stars >= livesCost) {
      try {
        if (!userChatId) {
          alert("Error: Chat ID is missing. Please try again.");
          return;
        }
  
        // Call the createInvoice function
        const invoiceLink = await createInvoice(userChatId, "Extra Life", "Purchase an additional life", livesCost);
  
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.openInvoice(invoiceLink, async (invoiceStatus) => {
          if (invoiceStatus === "paid") {
            alert("Star Payment Success!");

            const newLives = lives + 3;  // Increase lives upon successful payment
            setLives(newLives);

            // Update lives in Firebase
            await updateUserLives(userChatId, newLives);
          } else if (invoiceStatus === "failed") {
            alert("Payment Failed! Please try again.");
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
