import { useReducer, useEffect, useRef, useCallback } from 'react';
import { gameReducer, initialState } from '../reducers/gameReducer';
import {
  startGame,
  decreaseTime,
  resetGame,
  deductLife,
  addPoints,
  setSquirrelSide,
  addBranch,
  removeBranch,
  updateScrollOffset,
  setLifeDeducted,
  bonusActive,
  setSquirrelTop,
} from '../actions/gameActions';
import { useButterflies } from './useButterflies';
import { useClouds } from './useClouds';

export const useGameLogic = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const animationFrameId = useRef<number | null>(null);
  const lastFrameTime = useRef<number>(0); // Зберігаємо час останнього кадру
  const bonusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bonusActiveRef = useRef(false);
  const shouldAddBranchRef = useRef<boolean>(true);

  const { butterflies, updateButterflies } = useButterflies(state.gameStarted);
  const { clouds, updateClouds } = useClouds(state.gameStarted);

  // Генерація початкових 10 гілок
  const generateInitialBranches = () => {
    for (let i = 0; i < 10; i++) {
      const newBranchSide: 'left' | 'right' = Math.random() > 0.5 ? 'left' : 'right';
      const newBranchTop = window.innerHeight - 150 - i * 150;
      dispatch(addBranch({ side: newBranchSide, top: newBranchTop }));
    }
  };

  // Оптимізований цикл анімації з використанням requestAnimationFrame
  const gameLoop = useCallback(
      (currentTime: number) => {
        if (!lastFrameTime.current) {
          lastFrameTime.current = currentTime;
        }

        const deltaTime = currentTime - lastFrameTime.current; // Час, що пройшов між кадрами
        if (deltaTime >= 16) { // Оновлення кожні ~16 мс для 60 FPS
          lastFrameTime.current = currentTime;

          // Оновлюємо хмари та метеликів
          updateClouds();
          updateButterflies();

          // Видалення гілок, що вийшли за межі екрана
          if (state.branches.length > 0 && state.branches[0].top + state.scrollOffset > window.innerHeight) {
            dispatch(removeBranch());
            shouldAddBranchRef.current = true;
          }

          // Додаємо нові гілки, якщо необхідно
          if (shouldAddBranchRef.current && state.branches.length > 0 && state.branches[state.branches.length - 1].top + state.scrollOffset < window.innerHeight) {
            shouldAddBranchRef.current = false;
            const newBranchSide: 'left' | 'right' = state.branches[state.branches.length - 1].side === 'left' ? 'right' : 'left'; // Чередуємо сторону
            const newBranchTop = state.branches[state.branches.length - 1].top - 150;
            dispatch(addBranch({ side: newBranchSide, top: newBranchTop }));
          }

          // Оновлюємо положення камери та білки
          if (state.scrollOffset > 0) {
            dispatch(updateScrollOffset(state.scrollOffset - 2)); // Плавне прокручування
          }
        }

        animationFrameId.current = requestAnimationFrame(gameLoop);
      },
      [state.branches, state.scrollOffset, updateClouds, updateButterflies]
  );

  useEffect(() => {
    if (state.gameStarted) {
      generateInitialBranches();

      animationFrameId.current = requestAnimationFrame(gameLoop);

      return () => {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
      };
    }
  }, [state.gameStarted, gameLoop]);

  // Таймер гри
  useEffect(() => {
    if (state.gameStarted) {
      const timerInterval = setInterval(() => {
        dispatch(decreaseTime());
      }, 1000);

      return () => clearInterval(timerInterval);
    }
  }, [state.gameStarted]);

  const handleGameStart = () => {
    dispatch(startGame());
  };

  const handleBranchClick = useCallback(
      (side: 'left' | 'right', top: number) => {
        const clickedBranchIndex = state.branches.findIndex(
            (branch) => branch.side === side && Math.abs(branch.top - top) < 50
        );

        if (clickedBranchIndex !== -1) {
          dispatch(addPoints(bonusActiveRef.current ? 2 : 1));
          dispatch(setSquirrelSide(side));

          const targetBranch = state.branches[clickedBranchIndex];
          const newScrollOffset = state.scrollOffset + (window.innerHeight - targetBranch.top);

          dispatch(updateScrollOffset(newScrollOffset));
          dispatch(setSquirrelTop(targetBranch.top)); // Оновлюємо позицію білки

          // Видаляємо гілку, на яку білка стрибнула
          dispatch(removeBranch());
          shouldAddBranchRef.current = true;

          // Додаємо нові гілки по мірі проходження
          if (state.branches.length < 20 && shouldAddBranchRef.current) {
            shouldAddBranchRef.current = false;
            for (let i = 0; i < 10; i++) {
              const newBranchSide: 'left' | 'right' = Math.random() > 0.5 ? 'left' : 'right';
              const newBranchTop = state.branches[state.branches.length - 1].top - (i + 1) * 150;
              dispatch(addBranch({ side: newBranchSide, top: newBranchTop }));
            }
          }
        } else {
          dispatch(deductLife());
          if (state.lives - 1 <= 0) {
            alert('Game over! No more lives left.');
            dispatch(resetGame());
          }
        }
      },
      [state.branches, state.scrollOffset, state.lives]
  );

  const handleBonusActivation = useCallback(() => {
    dispatch(bonusActive(true));
    bonusActiveRef.current = true;
    if (bonusTimeoutRef.current) clearTimeout(bonusTimeoutRef.current);

    bonusTimeoutRef.current = setTimeout(() => {
      dispatch(bonusActive(false));
      bonusActiveRef.current = false;
    }, 5000);
  }, []);

  const handlePointsAddition = useCallback(() => {
    dispatch(addPoints(bonusActiveRef.current ? 2 : 1));
  }, []);

  const resetGameHandler = useCallback(() => {
    dispatch(resetGame());
  }, []);

  return {
    state,
    butterflies,
    clouds,
    handleGameStart,
    handleBranchClick,
    handleBonusActivation,
    handlePointsAddition,
    resetGame: resetGameHandler,
  };
};
