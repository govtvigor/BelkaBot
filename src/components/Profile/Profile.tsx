import React, { useState, useEffect } from 'react';
import Menu from '../Menu/Menu';
import './profile.scss';
import heartIcon from '../../assets/heart.png';
import fireIconGrey from '../../assets/fireIcon-gray.png';
import fireIconActive from '../../assets/fireIcon.png';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { saveUserToFirestore } from '../../firebaseFunctions';

interface ProfileProps {
  onMenuClick: (screen: 'game' | 'profile') => void;
}

const Profile: React.FC<ProfileProps> = ({ onMenuClick }) => {
  const [totalScore, setTotalScore] = useState<number>(0);
  const [isGMChecked, setIsGMChecked] = useState<boolean>(false);
  const [gmStreak, setGMStreak] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [stars, setStars] = useState<number>(100);

  // Инициализация TonConnectUI
  const [tonConnectUI, initializeTonConnectUI] = useTonConnectUI();

  useEffect(() => {
    // Загрузка общего счета из локального хранилища или другого источника
    const savedScore = localStorage.getItem('totalScore');
    if (savedScore) {
      setTotalScore(parseInt(savedScore, 10));
    }

    // Проверяем, заходил ли пользователь сегодня
    const lastGMDate = localStorage.getItem('lastGMDate');
    const savedStreak = localStorage.getItem('gmStreak');
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
      tonConnectUI.onStatusChange((wallet) => {
        if (wallet) {
          const walletAddress = wallet.account.address.toString(); // raw address
  
          console.log("Сохраняем адрес кошелька в формате Non-bouncable:", walletAddress);
          saveUserToFirestore(walletAddress); // Save the raw address; formatting happens inside the function
        }
      });
    }
  }, [tonConnectUI]);
  
  

  const updateTotalScore = (newScore: number) => {
    const updatedScore = totalScore + newScore;
    setTotalScore(updatedScore);
    localStorage.setItem('totalScore', updatedScore.toString());
  };

  const handleGMClick = () => {
    const today = new Date().toDateString();
    const lastGMDate = localStorage.getItem('lastGMDate');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();

    if (!isGMChecked) {
      setIsGMChecked(true);
      localStorage.setItem('lastGMDate', today);

      if (lastGMDate === yesterdayString) {
        // Увеличиваем счётчик, если был нажат вчера
        const newStreak = gmStreak + 1;
        setGMStreak(newStreak);
        localStorage.setItem('gmStreak', newStreak.toString());
      } else {
        // Сбрасываем счётчик, если вчера не был нажат
        setGMStreak(1);
        localStorage.setItem('gmStreak', '1');
      }
    }
  };

  const handleBuyLives = () => {
    if (stars >= 10) {
      setLives(lives + 1);
      setStars(stars - 10);
    } else {
      alert('У вас недостаточно звезд!');
    }
  };

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="header-leftside">
          <div className="gm" onClick={handleGMClick}>
            <img
              src={isGMChecked ? fireIconActive : fireIconGrey}
              alt="GM Icon"
              className="gm-icon"
            />
            {isGMChecked ? (
              <div>{gmStreak}</div>
            ) : (
              <span>GM</span>
            )}
          </div>
          <div className="profile_lives">
            <span>
              <img src={heartIcon} alt="lives" className="profile-lives-icon" />
              {lives}
            </span>
            <button onClick={handleBuyLives}>+</button>
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
