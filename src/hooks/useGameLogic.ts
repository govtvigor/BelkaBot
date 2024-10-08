// src/hooks/useGameLogic.ts

import { useReducer, useCallback, useEffect, useContext, useRef, useState } from 'react';
import { gameReducer, initialState } from '../reducers/gameReducer';
import { 
  setTimeLeft, 
  setLivesLoading, 
  setSquirrelSide, 
  setGameOver, 
  startGame, 
  resetGame, 
  deductLife, 
  addPoints, 
  setBranches, 
  setLives, 
  removeBranch, 
  setScrollOffset 
} from '../actions/gameActions';
import { ChatIdContext } from '../client/App';
import { achievements } from '../constants/achievements';
import {
  updateUserLivesAndLastResetDate,
  updateUserLives,
  getUserLivesData,
  updateUserTotalPoints,
  updateUserGameStats,
  getUserData,
  updateUserAchievements,
} from '../client/firebaseFunctions';

export const useGameLogic = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const userChatId = useContext(ChatIdContext);
  const timerRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number | null>(null);
  const afkTimerRef = useRef<number | null>(null);

  const [maxTime, setMaxTime] = useState(initialState.timeLeft);
  const [isJumping, setIsJumping] = useState(false);

  const resetAfkTimer = useCallback(() => {
    console.log("AFK timer reset");
    if (afkTimerRef.current) {
      clearTimeout(afkTimerRef.current);
    }
    afkTimerRef.current = window.setTimeout(() => {
      console.log("User is AFK");
      dispatch(setGameOver(true, 'afk'));
    }, 5000); // 5 seconds AFK timeout
  }, [dispatch]);

  useEffect(() => {
    if (state.gameStarted && !state.gameOver) {
      resetAfkTimer();

      const handleUserActivity = () => {
        resetAfkTimer();
      };

      // Add both 'pointerdown' and 'touchstart' event listeners
      window.addEventListener('pointerdown', handleUserActivity);
      window.addEventListener('touchstart', handleUserActivity);

      return () => {
        window.removeEventListener('pointerdown', handleUserActivity);
        window.removeEventListener('touchstart', handleUserActivity);
        if (afkTimerRef.current) {
          clearTimeout(afkTimerRef.current);
          afkTimerRef.current = null;
        }
      };
    }
  }, [state.gameStarted, state.gameOver, resetAfkTimer]);

  useEffect(() => {
    if (state.gameStarted && !state.gameOver) {
      const gameLoop = (currentTime: number) => {
        if (lastUpdateTimeRef.current === null) {
          lastUpdateTimeRef.current = currentTime;
        }
        const deltaTime = (currentTime - lastUpdateTimeRef.current) / 1000;
        lastUpdateTimeRef.current = currentTime;

        const newTimeLeft = Math.max(state.timeLeft - deltaTime, 0);
        dispatch(setTimeLeft(newTimeLeft));

        if (newTimeLeft <= 0) {
          dispatch(setGameOver(true, 'normal'));
          return;
        }

        timerRef.current = requestAnimationFrame(gameLoop);
      };

      timerRef.current = requestAnimationFrame(gameLoop);

      return () => {
        if (timerRef.current) {
          cancelAnimationFrame(timerRef.current);
        }
        lastUpdateTimeRef.current = null;
      };
    }
  }, [state.gameStarted, state.gameOver, state.timeLeft, dispatch]);

  useEffect(() => {
    if (state.gameStarted && !state.gameOver) {
      const handleUserActivity = () => {
        resetAfkTimer();
      };

      window.addEventListener('pointerdown', handleUserActivity);
      window.addEventListener('touchstart', handleUserActivity);

      return () => {
        window.removeEventListener('pointerdown', handleUserActivity);
        window.removeEventListener('touchstart', handleUserActivity);
      };
    }
  }, [state.gameStarted, state.gameOver, resetAfkTimer]);

  useEffect(() => {
    if (state.gameStarted && !state.gameOver && state.timeLeft <= 0) {
      dispatch(setGameOver(true, 'normal'));
    }
  }, [state.gameStarted, state.gameOver, state.timeLeft, dispatch]);

  const generateBranches = useCallback(() => {
    const newBranches = [];
    const spacing = 120; 
    for (let i = 0; i < 6; i++) {
      const side: 'left' | 'right' = Math.random() > 0.5 ? 'left' : 'right';
      const top = i * spacing; 
      newBranches.push({ side, top });
    }
    dispatch(setBranches(newBranches));
  }, [dispatch]);

  useEffect(() => {
    const fetchLives = async () => {
      if (userChatId) {
        try {
          const livesData = await getUserLivesData(userChatId);
          if (livesData !== undefined) {
            const today = new Date().toDateString();
            let updatedLives = livesData.lives;

            if (livesData.lastLivesResetDate !== today) {
              await updateUserLivesAndLastResetDate(userChatId, undefined, today);

              if (livesData.lives < 3) {
                updatedLives = 3;
                await updateUserLives(userChatId, updatedLives);
              }
            }

            dispatch(setLives(updatedLives));
          }
        } catch (error) {
          console.error('Error fetching lives from Firebase:', error);
        } finally {
          dispatch(setLivesLoading(false));
        }
      }
    };

    fetchLives();
  }, [userChatId, dispatch]);

  const handleGameOver = useCallback(async () => {
    const newLives = (state.lives || 0) - 1;
    dispatch(deductLife());

    if (userChatId) {
      try {
        await updateUserLives(userChatId, newLives);
      } catch (error) {
        console.error('Error updating lives in Firebase:', error);
      }
    }

    if (userChatId) {
      try {
        await updateUserTotalPoints(userChatId, state.points);
        await updateUserGameStats(userChatId, state.points);

        const userData = await getUserData(userChatId);

        if (userData) {
          const unlockedAchievements = achievements.filter(ach => ach.condition(userData));

          const newAchievements = unlockedAchievements
              .map(ach => ach.id)
              .filter(id => !(userData.achievements || []).includes(id));

          if (newAchievements.length > 0) {
            await updateUserAchievements(userChatId, newAchievements);
          }
        } else {
          console.error(`User data not found for chatId ${userChatId}`);
        }
      } catch (error) {
        console.error('Error updating user stats in Firebase:', error);
      }
    }

    dispatch(setGameOver(true, 'normal'));
  }, [dispatch, state.lives, state.points, userChatId]);

  const handleScreenClick = useCallback(
    (side: 'left' | 'right') => {
      resetAfkTimer();

      if (state.branches.length === 0 || state.gameOver) return;

      const currentBranch = state.branches[state.branches.length - 1];
      const correctSide = currentBranch?.side === side;

      if (correctSide) {
        dispatch(addPoints(1));
        dispatch(setSquirrelSide(side));
        setIsJumping(true);

        const timeIncrement = Math.max(0.05, 0.5 - state.points / 100);
        const newTimeLeft = state.timeLeft + timeIncrement;
        dispatch(setTimeLeft(newTimeLeft));

        if (newTimeLeft > maxTime) {
          setMaxTime(newTimeLeft);
        }

        const newSide: 'left' | 'right' = Math.random() > 0.5 ? 'left' : 'right';
        const newBranch = { side: newSide, top: 0 };
        let newBranches = [newBranch, ...state.branches];

        const spacing = 120;
        newBranches = newBranches.map((branch, index) => ({
          ...branch,
          top: index * spacing,
        }));

        dispatch(setBranches(newBranches));

        const scrollAmount = spacing - 85;
        const newScrollOffset = state.scrollOffset + scrollAmount;
        dispatch(setScrollOffset(newScrollOffset));

        setTimeout(() => {
          dispatch(removeBranch());
          setIsJumping(false);
        }, 300);
      } else {
        handleGameOver();
      }
    },
    [
      state.branches,
      state.gameOver,
      state.points,
      dispatch,
      handleGameOver,
      state.timeLeft,
      maxTime,
      state.scrollOffset,
      resetAfkTimer,
    ]
  );

  return {
    state,
    dispatch,
    handleScreenClick,
    startGame,
    generateBranches,
    maxTime,
    setIsJumping,
    resetAfkTimer
  };
};
