import React from 'react';
import './menu.scss';
const Menu = () => {
  const handleButtonClick = (event) => {
    event.stopPropagation(); // Останавливаем дальнейшее распространение клика
    // Можно добавить другие действия, которые должны происходить при клике на кнопку
  };

  return (
    <div className="menu">
      <div className="menu-buttons">
        <button onClick={handleButtonClick}>Главная</button>
        <button onClick={handleButtonClick}>Пари</button>
        <button onClick={handleButtonClick}>Профиль</button>
      </div>
    </div>
  );
};

export default Menu;
