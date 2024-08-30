// src/hooks/useClouds.ts

import { useState, useEffect } from 'react';

interface Cloud {
  id: string;
  top: number;
  left: number;
  isBigCloud: boolean;
}

const generateRandomClouds = (): Cloud[] => {
  const cloudsArray: Cloud[] = [];
  const numberOfClouds = Math.floor(Math.random()) + 1;
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

export const useClouds = () => {
  const [clouds, setClouds] = useState<Cloud[]>([]);

  useEffect(() => {
    const initialClouds = generateRandomClouds();
    setClouds(initialClouds);

    const interval = setInterval(() => {
      setClouds((prevClouds) =>
        prevClouds
          .map((cloud) => ({
            ...cloud,
            top: cloud.top + 5, // Adjust speed as needed
          }))
          .filter((cloud) => cloud.top < window.innerHeight)
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return { clouds };
};
