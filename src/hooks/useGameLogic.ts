// src/hooks/useGameLogic.ts

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
  updateScrollOffset
} from '../actions/gameActions';

export const useGameLogic = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const animationFrameId = useRef<number | null>(null);
  const bonusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bonusActiveRef = useRef(false);
  const shouldAddBranchRef = useRef<boolean>(true); // Флаг для контроля генерации веток

  const generateInitialBranches = () => {
    dispatch(addBranch({ side: 'left', top: window.innerHeight - 150 }));
    for (let i = 1; i < 100; i++) {
      const newBranchSide: 'left' | 'right' = Math.random() > 0.5 ? 'left' : 'right';
      const newBranchTop = window.innerHeight - 150 - i * 150;
      dispatch(addBranch({ side: newBranchSide, top: newBranchTop }));
    }
  };

  useEffect(() => {
    if (state.gameStarted) {
      generateInitialBranches();

      const gameLoop = () => {
        // Обновление смещения вниз
        if (state.scrollOffset > 0) {
          dispatch(updateScrollOffset(state.scrollOffset - 1));
        }

        // Удаляем ветку, если она вышла за пределы экрана
        if (state.branches.length > 0 && state.branches[0].top + state.scrollOffset > window.innerHeight) {
          dispatch(removeBranch());
          shouldAddBranchRef.current = true; // Устанавливаем флаг для добавления новой ветки
        }

        // Добавляем новую ветку, если предыдущая была удалена и флаг установлен
        if (shouldAddBranchRef.current && state.branches.length > 0 && state.branches[state.branches.length - 1].top + state.scrollOffset < window.innerHeight) {
          shouldAddBranchRef.current = false; // Сбрасываем флаг после добавления новой ветки
          const newBranchSide: 'left' | 'right' = Math.random() > 0.5 ? 'left' : 'right';
          dispatch(addBranch({ side: newBranchSide, top: -150 })); // Добавляем новую ветку сверху экрана
        }

        animationFrameId.current = requestAnimationFrame(gameLoop);
      };

      animationFrameId.current = requestAnimationFrame(gameLoop);

      return () => {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
      };
    }
  }, [state.gameStarted]); // Минимальные зависимости, чтобы избежать лишних рендеров

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
      // Получаем индекс самой нижней ветки, видимой на экране
      const bottomBranchIndex = state.branches.findIndex(
        (branch) => branch.top + state.scrollOffset >= window.innerHeight - 150
      );

      if (
        bottomBranchIndex !== -1 &&
        side === state.branches[bottomBranchIndex].side &&
        Math.abs(state.branches[bottomBranchIndex].top - top) < 50
      ) {
        dispatch(addPoints(bonusActiveRef.current ? 2 : 1));
        dispatch(setSquirrelSide(side));

        // Смещаем дерево и ветки вниз
        dispatch(updateScrollOffset(state.scrollOffset + 150));

        // Удаляем ветку, если она была достигнута белкой
        if (bottomBranchIndex === 0) {
          dispatch(removeBranch());
          shouldAddBranchRef.current = true; // Устанавливаем флаг для добавления новой ветки
        }
      } else {
        // Если игрок кликнул не на правильную ветку, отнимаем жизнь
        dispatch(deductLife());
        if (state.lives - 1 <= 0) {
          alert('Game over! No more lives left.');
          dispatch(resetGame());
        }
      }
    },
    [state.branches, state.scrollOffset, state.lives] // Добавляем правильные зависимости
  );

  const handleBonusActivation = useCallback(() => {
    dispatch({ type: 'BONUS_ACTIVE', payload: true });
    bonusActiveRef.current = true;
    if (bonusTimeoutRef.current) clearTimeout(bonusTimeoutRef.current);

    bonusTimeoutRef.current = setTimeout(() => {
      dispatch({ type: 'BONUS_ACTIVE', payload: false });
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
    handleGameStart,
    handleBranchClick,
    handleBonusActivation,
    handlePointsAddition, 
    resetGame: resetGameHandler,
  };
};
