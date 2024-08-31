// src/components/Menu/Menu.tsx

import React from 'react';
import './menu.scss'; // Основной стиль меню
import './profileMenu.scss'; // Специальный стиль для профиля

interface MenuProps {
  onMenuClick: (screen: 'game' | 'profile') => void;
  variant?: 'default' | 'profile'; // Пропс для выбора варианта стиля
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
