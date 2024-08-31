import { useState, useEffect } from 'react';

interface Cloud {
  id: string;
  top: number;
  left: number;
  isBigCloud: boolean;
}

const generateRandomClouds = (): Cloud[] => {
  const cloudsArray: Cloud[] = [];
  const numberOfClouds = Math.floor(Math.random() * 2) + 1;
  for (let i = 0; i < numberOfClouds; i++) {
    const top = Math.floor(Math.random() * window.innerHeight) - window.innerHeight;
    const left = Math.floor(Math.random() * (window.innerWidth - 100));
    const isBigCloud = Math.random() > 0.5;
    cloudsArray.push({
      id: `${isBigCloud ? 'big' : 'small'}-${Date.now()}-${i}`,
      top,
      left,
      isBigCloud,
    });
  }
  return cloudsArray;
};

export const useClouds = (gameStarted: boolean) => {
  const [clouds, setClouds] = useState<Cloud[]>([]);

  useEffect(() => {
    const initialClouds = generateRandomClouds();
    setClouds(initialClouds);

    if (gameStarted) {
      const interval = setInterval(() => {
        setClouds((prevClouds) =>
            prevClouds
                .map((cloud) => ({
                  ...cloud,
                  top: cloud.top + Math.sin(Date.now() / 500) * 1, // Мікро-рух хмар по горизонталі
                  left: cloud.left + Math.cos(Date.now() / 500) * 0.5,
                }))
                .filter((cloud) => cloud.top < window.innerHeight)
        );
      }, 1000 / 60); // 60 FPS

      return () => clearInterval(interval);
    }
  }, [gameStarted]);

  const updateClouds = () => {
    setClouds((prevClouds) =>
        prevClouds.map((cloud) => ({
          ...cloud,
          top: cloud.top + 5,
          left: cloud.left + Math.sin(cloud.top / 50) * 1, // Мікро-рух по горизонталі
        }))
    );
  };

  return { clouds, updateClouds };
};
