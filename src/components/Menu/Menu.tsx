// src/components/Menu/Menu.tsx

import React from 'react';
import './menu.scss';

// Define the props interface for the Menu component
interface MenuProps {
  onClick: () => void;
}

const Menu: React.FC<MenuProps> = ({ onClick }) => {
  return (
    <div className="menu">
      <div className="menu-buttons">
        <button onClick={onClick}>Home</button>
        <button onClick={onClick}>Bet</button>
        <button onClick={onClick}>Profile</button>
      </div>
    </div>
  );
};

export default Menu;
