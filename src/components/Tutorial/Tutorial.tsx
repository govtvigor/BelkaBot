// src/components/Tutorial/Tutorial.tsx

import React, { useState } from 'react';
import './tutorial.scss';
import gameAreaImage from '../../assets/tutorialBgFirst.png'; // Replace with actual paths
import profileImage from '../../assets/forest-bg-2.png'; // Replace with actual paths
import skinsImage from '../../assets/forest-bg-2.png'; // Replace with actual paths

interface TutorialProps {
  onConfirm: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ onConfirm }) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const slides = [
    {
      image: gameAreaImage,
      text: 'To earn points, simply click on the side of the screen closest to the branch. Quick reactions are key, as there is  a timer running! If you do click within 5 seconds, the game will end, and you’ll lose one life.',
    },
    {
      image: profileImage,
      text: 'When you run out of lives, you’ll need to buy more to keep playing. You can do this in the shop section of your profile. Every day, you will receive 3 free lives, but if you already have more than 3 lives, no additional lives will be given.',
    },
    {
      image: skinsImage,
      text: 'Buying skins boosts the points you earn in each game. These points will be converted into NUT coins at the end. Some skins will be limited, so make sure to grab them while you can!',
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div className="tutorial-overlay">
      <img src={slides[currentSlide].image} alt="Tutorial Slide" className="tutorial-image" />
      <div className="tutorial-content">
        
        <p className="tutorial-text">{slides[currentSlide].text}</p>
        <div className="tutorial-buttons">
          {currentSlide > 0 && <button onClick={handleBack}>Back</button>}
          {currentSlide < slides.length - 1 && <button onClick={handleNext}>Next</button>}
          {currentSlide === slides.length - 1 && <button onClick={handleConfirm}>Confirm</button>}
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
