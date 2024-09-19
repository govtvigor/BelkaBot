// src/components/Menu/Menu.tsx

import React from 'react';
import './menu.scss'; 
import './profileMenu.scss'; 

interface MenuProps {
  onMenuClick: (screen: 'game' | 'profile' | 'leaderboard') => void; // Updated to include 'leaderboard'
  variant?: 'default' | 'profile'; 
}

const Menu: React.FC<MenuProps> = ({ onMenuClick, variant = 'default' }) => {
  return (
    <div className={`menu ${variant === 'profile' ? 'menu-profile' : ''}`}>
      <div className="menu-buttons">
        <button onClick={() => onMenuClick('game')}>Home</button>
        <button onClick={() => onMenuClick('leaderboard')}>Leaderboard</button>
        <button onClick={() => onMenuClick('profile')}>Profile</button>
      </div>
    </div>
  );
};

export default Menu;
