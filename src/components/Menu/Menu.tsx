// src/components/Menu/Menu.tsx

import React from 'react';
import './menu.scss'; 
import './profileMenu.scss'; 

interface MenuProps {
  onMenuClick: (screen: 'game' | 'profile' | 'social') => void; // Updated to include 'leaderboard'
  variant?: 'social' | 'profile'; 
}

const Menu: React.FC<MenuProps> = ({ onMenuClick, variant = 'default' }) => {
  return (
    <div className={`menu ${variant === 'profile' ? 'menu-profile' : ''}`}>
      <div className="menu-buttons">
        <button onClick={() => onMenuClick('game')}>Home</button>
        <button onClick={() => onMenuClick('social')}>Leaderboard</button>
        <button onClick={() => onMenuClick('profile')}>Profile</button>
      </div>
    </div>
  );
};

export default Menu;
