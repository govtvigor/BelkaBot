import React from "react";
import "./shopModal.scss";
import SnowLandscapeIcon from "../../../assets/snowLandscape.png";
import DesertLandscapeIcon from "../../../assets/desertLandscape.png";
import heartIcon from "../../../assets/heart.png"; // Import heart icon
import { handleBuyLives } from "../paymentHandler";
import { useTranslation } from 'react-i18next';

interface ShopModalProps {
  onClose: () => void;
  userChatId: string | null;
  stars: number;
  lives: number;
  setLives: React.Dispatch<React.SetStateAction<number>>;
}

const ShopModal: React.FC<ShopModalProps> = ({
  onClose,
  userChatId,
  stars,
  lives,
  setLives,
}) => {
  const { t } = useTranslation(); // Initialize the translation function
  const landscapes = [
    { id: 1, name: "landscape.snow", image: SnowLandscapeIcon },
    { id: 2, name: "landscape.desert", image: DesertLandscapeIcon },
  ];

  const handleBuyLivesAction = () => {
    handleBuyLives(stars, lives, setLives, userChatId);
  };

  return (
    <div className="shop-modal">
      <div className="shop-modal-content">
        <button className="close-button" onClick={onClose}>
          X
        </button>
        <h2 className="modal-title">{t('profile.shop')}</h2>

        {/* Buy Lives Section */}
        <div className="buy-lives-section">
          <div className="lives-icon-block">
            <img src={heartIcon} alt="Lives" className="lives-icon" />
          </div>
          <div className="buy-lives-info">
            <p>{t('profile.lives_title')}</p>
            <button className="buy-button" onClick={handleBuyLivesAction}>
              {t('profile.buy')}
            </button>
          </div>
        </div>

        {/* Landscapes Section */}
        <div className="landscapes-container">
          {landscapes.map((landscape) => (
            <div key={landscape.id} className="landscape-item">
              <div
                className="landscape-image-block"
              ><img src={landscape.image} alt="" className="landscape-image" /></div>
              <div className="landscape-info">
                <p className="landscape-name">{t(landscape.name)}</p>
                <p className="multiplier-info">1.5x NUT</p>
                <button className="buy-button">{t('profile.buy')}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopModal;
