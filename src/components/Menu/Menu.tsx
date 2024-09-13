import React from 'react';
import './menu.scss';
import './profileMenu.scss';

interface MenuProps {
  onMenuClick: (screen: 'game' | 'profile') => void;
  variant?: 'default' | 'profile'; 
}

const Menu: React.FC<MenuProps> = ({ onMenuClick, variant = 'default' }) => {
  return (
    <div className={`menu ${variant === 'profile' ? 'menu-profile' : ''}`}>
      <div className="menu-buttons">
        <button onClick={() => onMenuClick('game')}>Home</button>
        <button onClick={() => onMenuClick('game')}>Bet</button>
        <button onClick={() => onMenuClick('profile')}>Profile</button>
      </div>
    </div>
  );
};

export default Menu;
