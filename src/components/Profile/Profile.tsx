import React, { useState, useEffect } from "react";
import Menu from "../Menu/Menu";
import "./profile.scss";
import heartIcon from "../../assets/heart.png";
import fireIconGrey from "../../assets/fireIcon-gray.png";
import fireIconActive from "../../assets/fireIcon.png";
import { TonConnectButton, useTonConnectUI } from "@tonconnect/ui-react";
import { saveUserToFirestore, getChatIdFromApi } from "../../firebaseFunctions"; // New function to get chat ID from your API

interface ProfileProps {
  onMenuClick: (screen: "game" | "profile") => void;
}

const Profile: React.FC<ProfileProps> = ({ onMenuClick }) => {
  const [totalScore, setTotalScore] = useState<number>(0);
  const [isGMChecked, setIsGMChecked] = useState<boolean>(false);
  const [gmStreak, setGMStreak] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [stars, setStars] = useState<number>(100); // User's current Stars balance
  const [userChatId, setUserChatId] = useState<string | null>(null); // State to hold user chat ID

  const [tonConnectUI, initializeTonConnectUI] = useTonConnectUI();

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
    const savedScore = localStorage.getItem("totalScore");
    if (savedScore) {
      setTotalScore(parseInt(savedScore, 10));
    }

    const lastGMDate = localStorage.getItem("lastGMDate");
    const savedStreak = localStorage.getItem("gmStreak");
    const today = new Date().toDateString();

    if (lastGMDate === today) {
      setIsGMChecked(true);
    }

    if (savedStreak) {
      setGMStreak(parseInt(savedStreak, 10));
    }
  }, []);

  useEffect(() => {
    if (tonConnectUI) {
      tonConnectUI.onStatusChange(async (wallet) => {
        if (wallet) {
          const walletAddress = wallet.account.address.toString();
          const chatId = await getChatIdFromApi(walletAddress); // Получаем chatId
          await saveUserToFirestore(walletAddress, chatId); // Сохраняем пользователя с chatId
          setUserChatId(chatId);
        }
      });
    }
  }, [tonConnectUI]);
  

  const createInvoice = async (invoiceDetails: {
    title: string;
    description: string;
    currency: string;
    amount: number;
  }) => {
    const response = await fetch("/api/create-invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invoiceDetails),
    });

    if (!response.ok) {
      throw new Error("Failed to create invoice");
    }

    return response.json(); // Return the invoice details
  };

  const handleBuyLives = async () => {
    const livesCost = 10;
  
    if (stars >= livesCost) {
      try {
        // Отправка запроса на сервер для создания инвойса
        const response = await fetch("/api/create-invoice", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ chatId: userChatId, livesCost }), // Отправляем chatId и стоимость жизней
        });
  
        if (!response.ok) {
          throw new Error("Failed to create invoice");
        }
  
        const result = await response.json();
        console.log("Invoice created:", result);
        alert("Инвойс успешно создан. Проверьте Telegram для оплаты."); // Оповещаем пользователя
      } catch (error) {
        console.error("Error creating invoice:", error);
        alert("Не удалось создать инвойс. Попробуйте еще раз.");
      }
    } else {
      alert("У вас недостаточно звезд!"); // "You do not have enough stars!"
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
