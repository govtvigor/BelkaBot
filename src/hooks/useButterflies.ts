// src/hooks/useButterflies.ts

import { useState, useEffect } from 'react';

interface Butterfly {
  id: string;
  top: number;
  left: number;
  isBlueButterfly: boolean;
}

const generateRandomButterfly = (): Butterfly => {
  const top = -50;
  const left = Math.floor(Math.random() * window.innerWidth);
  const isBlueButterfly = Math.random() > 0.5;

  return {
    id: `${isBlueButterfly ? 'blue' : 'green'}-${Date.now()}`,
    top,
    left,
    isBlueButterfly,
  };
};

export const useButterflies = () => {
  const [butterflies, setButterflies] = useState<Butterfly[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setButterflies((prevButterflies) =>
        prevButterflies
          .map((butterfly) => ({
            ...butterfly,
            top: butterfly.top + 5, // Adjust speed as needed
            left: butterfly.left + Math.sin(butterfly.top / 50) * 5,
          }))
          .filter((butterfly) => butterfly.top < window.innerHeight)
      );

      if (Math.random() < 0.02) {
        setButterflies((prevButterflies) => [...prevButterflies, generateRandomButterfly()]);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return { butterflies };
};
