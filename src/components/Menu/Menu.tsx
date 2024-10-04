// src/components/Menu/Menu.tsx

import React from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation hook for translations
import './menu.scss';
import './profileMenu.scss';

interface MenuProps {
  onMenuClick: (screen: 'game' | 'profile' | 'social') => void;
  variant?: 'social' | 'profile';
}

const Menu: React.FC<MenuProps> = ({ onMenuClick, variant = 'default' }) => {
  const { t } = useTranslation(); // Initialize the translation function

  return (
    <div className={`menu ${variant === 'profile' ? 'menu-profile' : ''}`}>
      <div className="menu-buttons">
        <button onClick={() => onMenuClick('game')}>{t('menu.game')}</button> {/* Translated Game */}
        <button onClick={() => onMenuClick('social')}>{t('menu.tasks')}</button> {/* Translated Tasks */}
        <button onClick={() => onMenuClick('profile')}>{t('menu.profile')}</button> {/* Translated Profile */}
      </div>
    </div>
  );
};

export default Menu;
