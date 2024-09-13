// src/hooks/useGameLogic.ts

import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  startGame,
  resetGame,
  deductLife,
  addPoints,
  setSquirrelSide,
  setBranches,
  addBranch,
  removeBranch,
  updateScrollOffset,
  setSquirrelTop,
} from '../actions/gameActions';
import { useButterflies } from './useButterflies';
import { useClouds } from './useClouds';
import { RootState } from '../reducers';
import { Branch } from '../reducers/gameReducer';

type Side = 'left' | 'right';

export const useGameLogic = () => {
  const reduxDispatch = useDispatch();

  // Використовуємо RootState для типізації стану
  const gameState = useSelector((state: RootState) => state.game);
  const { branches, squirrelSide, squirrelTop, scrollOffset, lives, gameStarted } = gameState;

  const animationFrameId = useRef<number | null>(null);
  const lastFrameTime = useRef<number>(0);

  // Використовуємо хуки для отримання хмар та метеликів
  const { butterflies, updateButterflies } = useButterflies(gameStarted);
  const { clouds, updateClouds } = useClouds(gameStarted);

  const branchSpacing = 150; // Відстань між гілками
  const squirrelHeight = 50; // Висота білки (замініть на реальне значення)
  const groundHeight = 100; // Висота землі (замініть на реальне значення)

  // Генерація початкових гілок
  const generateInitialBranches = useCallback(() => {
    const initialBranches: Branch[] = [];
    for (let i = 0; i < 5; i++) {
      const side: Side = Math.random() > 0.5 ? 'left' : 'right';
      const top = window.innerHeight - groundHeight - (i + 1) * branchSpacing;
      initialBranches.push({ side, top });
    }

    reduxDispatch(setBranches(initialBranches));

    // Встановлюємо початкову позицію білки на землі
    reduxDispatch(setSquirrelSide('left'));
    reduxDispatch(setSquirrelTop(window.innerHeight - squirrelHeight - groundHeight));
  }, [reduxDispatch]);

  // Рух білочки на ліво або право
  const moveSquirrel = useCallback(
      (side: Side) => {
        reduxDispatch(setSquirrelSide(side));
      },
      [reduxDispatch]
  );

  // Обробка кліку на гілку
  const handleBranchClick = useCallback(
      (side: Side) => {
        if (branches.length === 0) return;

        const currentBranch = branches[branches.length - 1]; // Остання гілка у масиві
        const correctSide = currentBranch.side === side;

        if (correctSide) {
          moveSquirrel(side);

          // Видаляємо поточну гілку
          reduxDispatch(removeBranch());

          // Генеруємо нову гілку зверху
          const newSide: Side = Math.random() > 0.5 ? 'left' : 'right';
          const newBranchTop = branches[0].top - branchSpacing;
          const newBranch: Branch = { side: newSide, top: newBranchTop };
          reduxDispatch(addBranch(newBranch));

          // Оновлюємо позицію білки
          const newSquirrelTop = currentBranch.top;
          reduxDispatch(setSquirrelTop(newSquirrelTop));

          // Оновлюємо зсув прокрутки для паралакс ефекту
          reduxDispatch(updateScrollOffset(gameState.scrollOffset + branchSpacing));

          // Додаємо очки
          reduxDispatch(addPoints(1));

          // Анімація білки
          const squirrelElement = document.getElementById('squirrel');
          if (squirrelElement) {
            squirrelElement.classList.add('jump-animation');
            setTimeout(() => {
              squirrelElement.classList.remove('jump-animation');
            }, 500); // Тривалість анімації
          }
        } else {
          // Гравець обрав неправильну сторону
          reduxDispatch(deductLife());

          if (lives - 1 <= 0) {
            alert('Гру закінчено! У вас не залишилось життів.');
            reduxDispatch(resetGame());
          }
        }
      },
      [branches, moveSquirrel, reduxDispatch, lives, gameState.scrollOffset]
  );

  const gameLoop = useCallback(
      (currentTime: number) => {
        animationFrameId.current = requestAnimationFrame(gameLoop);

        if (!lastFrameTime.current) {
          lastFrameTime.current = currentTime;
        }

        const deltaTime = currentTime - lastFrameTime.current;
        if (deltaTime >= 16) {
          lastFrameTime.current = currentTime;

          updateClouds();
          updateButterflies();

          // Можливо, додаткові оновлення гри
        }
      },
      [updateClouds, updateButterflies]
  );

  useEffect(() => {
    if (gameStarted) {
      generateInitialBranches();
      animationFrameId.current = requestAnimationFrame(gameLoop);

      return () => {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
      };
    }
  }, [gameStarted]);

  const handleGameStart = () => {
    if (!gameStarted) {
      reduxDispatch(startGame());

      // Після старту гри білка стрибає на першу гілку
      const firstBranch = gameState.branches[gameState.branches.length - 1];
      if (firstBranch) {
        reduxDispatch(setSquirrelTop(firstBranch.top));

        // Анімація стрибка білки
        const squirrelElement = document.getElementById('squirrel');
        if (squirrelElement) {
          squirrelElement.classList.add('jump-animation');
          setTimeout(() => {
            squirrelElement.classList.remove('jump-animation');
          }, 500); // Тривалість анімації
        }
      }
    }
  };

  const resetGameHandler = useCallback(() => {
    reduxDispatch(resetGame());
    generateInitialBranches();
  }, [reduxDispatch, generateInitialBranches]);

  return {
    state: gameState,
    butterflies,
    clouds,
    handleGameStart,
    handleBranchClick,
    resetGame: resetGameHandler,
  };
};
