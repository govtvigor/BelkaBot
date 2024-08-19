import React from 'react';
import './menu.scss';

const Menu = ({ onClick }) => {
  return (
    <div className="menu">
      <div className="menu-buttons">
        <button onClick={onClick}>Главная</button>
        <button onClick={onClick}>Пари</button>
        <button onClick={onClick}>Профиль</button>
      </div>
    </div>
  );
};

export default Menu;

