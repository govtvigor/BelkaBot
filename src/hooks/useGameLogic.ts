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
  const lastFrameTime = useRef<number>(0);
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

      // Перевіряємо, чи немає гілки на тій самій висоті
      if (!state.branches.some(branch => branch.top === newBranchTop)) {
        dispatch(addBranch({ side: newBranchSide, top: newBranchTop }));
      }
    }
  };

  // Анімація стрибка білки до першої гілки
  const animateSquirrelToFirstBranch = useCallback(() => {
    const targetBranch = state.branches[0];
    if (!targetBranch) return;

    const duration = 500; // Тривалість анімації в мілісекундах
    let start: number | undefined;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const proportion = Math.min(progress / duration, 1);

      // Обчислити нову позицію білки
      const newTop = window.innerHeight - proportion * (window.innerHeight - targetBranch.top);
      dispatch(setSquirrelTop(newTop));

      // Плавний рух камери
      const newScrollOffset = window.innerHeight - newTop;
      dispatch(updateScrollOffset(newScrollOffset));

      if (proportion < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [state.branches]);

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
            const newBranchSide: 'left' | 'right' = Math.random() > 0.5 ? 'left' : 'right';
            const newBranchTop = state.branches[state.branches.length - 1].top - 150;
            dispatch(addBranch({ side: newBranchSide, top: newBranchTop }));
          }
        }

        animationFrameId.current = requestAnimationFrame(gameLoop);
      },
      [state.branches, state.scrollOffset, updateClouds, updateButterflies]
  );

  useEffect(() => {
    if (state.gameStarted) {
      generateInitialBranches();

      // Плавно підняти білку і камеру до першої гілки
      animateSquirrelToFirstBranch();

      animationFrameId.current = requestAnimationFrame(gameLoop);

      return () => {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
      };
    }
  }, [state.gameStarted, gameLoop, animateSquirrelToFirstBranch]);

  // Логіка для додавання нових гілок в процесі гри
  useEffect(() => {
    if (shouldAddBranchRef.current && state.branches.length > 0) {
      shouldAddBranchRef.current = false;

      const lastBranch = state.branches[state.branches.length - 1];
      const newBranchSide: 'left' | 'right' = Math.random() > 0.5 ? 'left' : 'right';
      const newBranchTop = lastBranch.top - 150;

      // Додаємо нову гілку, якщо на цій висоті немає жодної гілки
      if (!state.branches.some(branch => branch.top === newBranchTop)) {
        dispatch(addBranch({ side: newBranchSide, top: newBranchTop }));
      }
    }
  }, [state.branches]);

  // Плавне переміщення камери і білки
  const smoothScrollTo = useCallback((targetScrollOffset: number, targetSquirrelTop: number) => {
    const startScrollOffset = state.scrollOffset;
    const startSquirrelTop = state.squirrelTop;
    const duration = 500; // тривалість анімації у мілісекундах
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1); // прогрес анімації від 0 до 1

      const newScrollOffset = startScrollOffset + (targetScrollOffset - startScrollOffset) * progress;
      const newSquirrelTop = startSquirrelTop + (targetSquirrelTop - startSquirrelTop) * progress;

      dispatch(updateScrollOffset(newScrollOffset));
      dispatch(setSquirrelTop(newSquirrelTop));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [state.scrollOffset, state.squirrelTop]);

  const handleGameStart = () => {
    dispatch(startGame());
    animateSquirrelToFirstBranch();
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

          smoothScrollTo(newScrollOffset, targetBranch.top);

          dispatch(updateScrollOffset(newScrollOffset));
          dispatch(setSquirrelTop(targetBranch.top)); // Оновлюємо позицію білки

          // Видаляємо гілку, на яку білка стрибнула
          dispatch(removeBranch());
          shouldAddBranchRef.current = true;
        } else {
          dispatch(deductLife());
          if (state.lives - 1 <= 0) {
            alert('Game over! No more lives left.');
            dispatch(resetGame());
          }
        }
      },
      [state.branches, state.scrollOffset, state.lives, smoothScrollTo]
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
