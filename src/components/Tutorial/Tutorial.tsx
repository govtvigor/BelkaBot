// src/components/Tutorial/Tutorial.tsx

import React, { useState } from 'react';
import './tutorial.scss';
import gameAreaImage from '../../assets/forest-bg-2.png'; // Replace with actual paths
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
      text: 'Welcome to the game! Here are the rules: ...',
    },
    {
      image: profileImage,
      text: 'You need to buy lives to continue playing when you run out.',
    },
    {
      image: skinsImage,
      text: 'Buying skins allows you to customize your character.',
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
      <div className="tutorial-content">
        <img src={slides[currentSlide].image} alt="Tutorial Slide" className="tutorial-image" />
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
