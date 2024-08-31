// src/components/Profile/Profile.tsx

import React, { useState, useEffect } from "react";
import Menu from "../Menu/Menu"; // Импортируем Menu для возврата на экран игры
import "./profile.scss"; // Добавьте стили для вашего компонента профиля
import heartIcon from '../../assets/heart.png';
import fireIcon from '../../assets/fireIcon-gray.png';
import fireFilledIcon from '../../assets/fireIcon.png';
import TonConnect, { WalletInfoRemote } from '@tonconnect/sdk'; // Импортируем TonConnect и WalletInfoRemote

interface ProfileProps {
  onMenuClick: (screen: "game" | "profile") => void;
}

const Profile: React.FC<ProfileProps> = ({ onMenuClick }) => {
  const [totalScore, setTotalScore] = useState<number>(0);
  const [isGMChecked, setIsGMChecked] = useState<boolean>(false);
  const [lives, setLives] = useState<number>(3);
  const [stars, setStars] = useState<number>(100);
  const [wallet, setWallet] = useState<string | null>(null); // Изменено на строку для хранения адреса кошелька

  // Инициализация TonConnect
  const tonConnect = new TonConnect();

  useEffect(() => {
    const savedScore = localStorage.getItem("totalScore");
    if (savedScore) {
      setTotalScore(parseInt(savedScore, 10));
    }

    const lastGMDate = localStorage.getItem("lastGMDate");
    const today = new Date().toISOString().split('T')[0];
    if (lastGMDate === today) {
      setIsGMChecked(true);
    }

    // Восстановление состояния подключения кошелька
    const checkWalletConnection = async () => {
      try {
        const connectedWallets = tonConnect.wallet;
        if (connectedWallets) {
          setWallet(connectedWallets.account.address); // Устанавливаем адрес подключенного кошелька
        }
      } catch (error) {
        console.error("Не удалось восстановить подключение к кошельку:", error);
      }
    };

    checkWalletConnection();
  }, [tonConnect]);

  const updateTotalScore = (newScore: number) => {
    const updatedScore = totalScore + newScore;
    setTotalScore(updatedScore);
    localStorage.setItem("totalScore", updatedScore.toString());
  };

  const handleGMClick = () => {
    if (!isGMChecked) {
      setIsGMChecked(true);
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem("lastGMDate", today);
      updateTotalScore(10);
    } else {
      alert("Вы уже отметились сегодня!");
    }
  };

  const handleBuyLives = () => {
    if (stars >= 10) {
      setLives(lives + 1);
      setStars(stars - 10);
    } else {
      alert("У вас недостаточно звезд!");
    }
  };

  const connectTonWallet = async () => {
    try {
      const availableWallets = await tonConnect.getWallets(); // Получаем доступные кошельки
      const remoteWallet = availableWallets.find(wallet => (wallet as WalletInfoRemote).universalLink); // Ищем удаленный кошелек

      if (remoteWallet && 'universalLink' in remoteWallet) {
        await tonConnect.connect({ universalLink: (remoteWallet as WalletInfoRemote).universalLink, bridgeUrl: (remoteWallet as WalletInfoRemote).bridgeUrl });
        setWallet(tonConnect.wallet?.account.address || null);
        alert("Кошелек Тон успешно подключен!");
      } else {
        alert("Кошелек Тон не найден!");
      }
    } catch (error) {
      console.error("Ошибка подключения к кошельку Тон:", error);
      alert("Не удалось подключить кошелек Тон.");
    }
  };

  const disconnectTonWallet = async () => {
    try {
      await tonConnect.disconnect();
      setWallet(null);
      alert("Кошелек отключен.");
    } catch (error) {
      console.error("Ошибка отключения кошелька Тон:", error);
    }
  };

  return (
    <div className="profile">
      <Menu onMenuClick={onMenuClick} variant="profile" />

      <div className="profile-header">
        <div className="header-leftside">
          <div className="gm" onClick={handleGMClick}>
            <img src={isGMChecked ? fireFilledIcon : fireIcon} alt="GM Icon" className="gm-icon" />
            {isGMChecked ? "GM!" : "GM"}
          </div>
          <div className="profile_lives">
            <span><img src={heartIcon} alt="lives" className="profile-lives-icon"/>{lives}</span>
            <button onClick={handleBuyLives}>+</button>
          </div>
        </div>
        <div className="crypto-wallet">
          {wallet ? (
            <>
              <span>Кошелек: {wallet}</span>
              <button onClick={disconnectTonWallet}>Отключить кошелек</button>
            </>
          ) : (
            <button onClick={connectTonWallet}>Подключить кошелек Тон</button>
          )}
        </div>
      </div>

      <div className="profile-body">
        <h2>Профиль игрока</h2>
        <div className="total-score">
          <p>Общий счет: {totalScore}</p>
        </div>
        <div className="achievements">
          <h3>Достижения</h3>
          <p>Скоро появится...</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
