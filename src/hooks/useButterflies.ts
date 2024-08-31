import { useState, useEffect } from 'react';

interface Butterfly {
  id: string;
  top: number;
  left: number;
  isBlueButterfly: boolean;
}

const generateRandomButterfly = (): Butterfly => {
  const top = Math.random() * window.innerHeight; // Додаємо випадкову висоту
  const left = Math.floor(Math.random() * window.innerWidth);
  const isBlueButterfly = Math.random() > 0.5;

  return {
    id: `${isBlueButterfly ? 'blue' : 'green'}-${Date.now()}`,
    top,
    left,
    isBlueButterfly,
  };
};

export const useButterflies = (gameStarted: boolean) => {
  const [butterflies, setButterflies] = useState<Butterfly[]>([]);

  useEffect(() => {
    if (gameStarted) {
      const interval = setInterval(() => {
        setButterflies((prevButterflies) =>
            prevButterflies
                .map((butterfly) => ({
                  ...butterfly,
                  left: butterfly.left + Math.sin(Date.now() / 500) * 2,
                  top: butterfly.top + Math.cos(Date.now() / 500) * 2,
                }))
                .filter((butterfly) => butterfly.top < window.innerHeight)
        );

        if (Math.random() < 0.02) {
          setButterflies((prevButterflies) => [
            ...prevButterflies,
            generateRandomButterfly(),
          ]);
        }
      }, 1000 / 60); // 60 FPS

      return () => clearInterval(interval);
    }
  }, [gameStarted]);
  const updateButterflies = () => {
    setButterflies((prevButterflies) =>
        prevButterflies.map((butterfly) => ({
          ...butterfly,
          top: butterfly.top + 5,
          left: butterfly.left + Math.sin(butterfly.top / 50) * 5,
        }))
    );
  };

  return { butterflies, updateButterflies };
};
