import React from "react";
import "./shopModal.scss";
import SnowLandscapeIcon from "../../../assets/snowLandscape.png";
import DesertLandscapeIcon from "../../../assets/desertLandscape.png";
import heartIcon from "../../../assets/heart.png"; // Import heart icon
import { handleBuyLives } from "../paymentHandler";

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
  const landscapes = [
    { id: 1, name: "Snow Landscape", image: SnowLandscapeIcon },
    { id: 2, name: "Desert Landscape", image: DesertLandscapeIcon },
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
        <h2 className="modal-title">Shop</h2>

        {/* Buy Lives Section */}
        <div className="buy-lives-section">
          <div className="lives-icon-block">
            <img src={heartIcon} alt="Lives" className="lives-icon" />
          </div>
          <div className="buy-lives-info">
            <p>Need more lives? Buy them here!</p>
            <button className="buy-button" onClick={handleBuyLivesAction}>
              Buy Lives
            </button>
          </div>
        </div>

        {/* Landscapes Section */}
        <div className="landscapes-container">
          {landscapes.map((landscape) => (
            <div key={landscape.id} className="landscape-item">
              <div
                className="landscape-image"
                style={{
                  backgroundImage: `url(${landscape.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
              <div className="landscape-info">
                <p className="landscape-name">{landscape.name}</p>
                <p className="multiplier-info">1.5x NUT</p>
                <button className="buy-button">Buy</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopModal;
