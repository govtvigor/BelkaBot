import React from "react";
import "./shopModal.scss";
import SnowLandscapeIcon from "../../../assets/snowLandscape.png";
import DesertLandscapeIcon from "../../../assets/desertLandscape.png";

interface ShopModalProps {
  onClose: () => void;
}

const ShopModal: React.FC<ShopModalProps> = ({ onClose }) => {
  const landscapes = [
    { id: 1, name: "Snow Landscape", image: SnowLandscapeIcon },
    { id: 2, name: "Desert Landscape", image: DesertLandscapeIcon },
  ];

  return (
    <div className="shop-modal">
      <div className="shop-modal-content">
        <button className="close-button" onClick={onClose}>
          X
        </button>
        <h2 className="modal-title">Shop</h2>
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
              >
                
              </div>
              <div className="landscape-info">
                <p className="landscape-name">{landscape.name}</p>
                <p className="multiplier-info">
                  1.5x NUT 
                </p>
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
