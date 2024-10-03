import { useReducer, useCallback, useEffect, useContext, useRef, useState } from 'react';
import { gameReducer, initialState } from '../reducers/gameReducer';
import { setTimeLeft, setGameOver } from '../actions/gameActions';
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
import {
  startGame,
  resetGame,
  deductLife,
  addPoints,
  setSquirrelSide,
  setBranches,
  setGameOver as actionSetGameOver,
  setLives,
  setLivesLoading,
  setScrollOffset,
  removeBranch, 
} from '../actions/gameActions';

export const useGameLogic = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const userChatId = useContext(ChatIdContext);
  const timerRef = useRef<number | null>(null);
  const [maxTime, setMaxTime] = useState(initialState.timeLeft);
  const lastUpdateTimeRef = useRef<number | null>(null);

  // Стан для відстеження стрибка
  const [isJumping, setIsJumping] = useState(false);

  // Timer to decrease time left
  useEffect(() => {
    if (state.gameStarted && !state.gameOver) {
      const gameLoop = (currentTime: number) => {
        if (lastUpdateTimeRef.current === null) {
          lastUpdateTimeRef.current = currentTime;
        }
        const deltaTime = (currentTime - lastUpdateTimeRef.current) / 1000; // Convert to seconds
        lastUpdateTimeRef.current = currentTime;

        const newTimeLeft = Math.max(state.timeLeft - deltaTime, 0);
        dispatch(setTimeLeft(newTimeLeft));

        if (newTimeLeft <= 0) {
          dispatch(setGameOver(true));
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

  // End game when time runs out without deducting a life
  useEffect(() => {
    if (state.gameStarted && !state.gameOver && state.timeLeft <= 0) {
      dispatch(actionSetGameOver(true));
    }
  }, [state.gameStarted, state.gameOver, state.timeLeft, dispatch]);

  // Generate branches function
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

  // Fetch lives from Firebase
  useEffect(() => {
    const fetchLives = async () => {
      if (userChatId) {
        try {
          const livesData = await getUserLivesData(userChatId);
          if (livesData !== undefined) {
            // Reset lives if last reset date is not today
            const today = new Date().toDateString();
            let updatedLives = livesData.lives;

            if (livesData.lastLivesResetDate !== today) {
              // Reset lives to 3
              updatedLives = 3;
              await updateUserLivesAndLastResetDate(userChatId, updatedLives, today);
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

  // Handle Game Over when player makes a mistake
  const handleGameOver = useCallback(async () => {
    const newLives = (state.lives || 0) - 1;
    dispatch(deductLife()); // Decrement lives in the state

    // Update lives in Firebase
    if (userChatId) {
      try {
        await updateUserLives(userChatId, newLives);
      } catch (error) {
        console.error('Error updating lives in Firebase:', error);
      }
    }

    // Update total points and game stats in Firebase
    if (userChatId) {
      try {
        await updateUserTotalPoints(userChatId, state.points);
        await updateUserGameStats(userChatId, state.points);

        // Fetch user data
        const userData = await getUserData(userChatId);

        if (userData) {
          // Check for new achievements
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

    dispatch(actionSetGameOver(true));
  }, [dispatch, state.lives, state.points, userChatId]);

  // Handle screen click
  const handleScreenClick = useCallback(
      (side: 'left' | 'right') => {
        if (state.branches.length === 0 || state.gameOver) return;

        const currentBranch = state.branches[state.branches.length - 1];
        const correctSide = currentBranch?.side === side;

        if (correctSide) {
          dispatch(addPoints(1));
          dispatch(setSquirrelSide(side));
          setIsJumping(true); // Починаємо стрибок

          const timeIncrement = Math.max(0.05, 0.5 - state.points / 100);
          const newTimeLeft = state.timeLeft + timeIncrement;
          dispatch(setTimeLeft(newTimeLeft));

          if (newTimeLeft > maxTime) {
            setMaxTime(newTimeLeft);
          }

          // Додаємо нову гілку зверху
          const newSide: 'left' | 'right' = Math.random() > 0.5 ? 'left' : 'right';
          const newBranch = { side: newSide, top: 0 }; // Починаємо з позиції top = 0
          let newBranches = [newBranch, ...state.branches];

          // Оновлюємо позиції всіх гілок
          const spacing = 120; // Відстань між гілками
          newBranches = newBranches.map((branch, index) => ({
            ...branch,
            top: index * spacing,
          }));

          // Оновлюємо гілки в стані
          dispatch(setBranches(newBranches));

          // Оновлюємо scrollOffset
          const scrollAmount = spacing - 85;
          const newScrollOffset = state.scrollOffset + scrollAmount;
          dispatch(setScrollOffset(newScrollOffset));

          // Видаляємо гілку після завершення стрибка
          setTimeout(() => {
            dispatch(removeBranch());
            setIsJumping(false); 
          }, 100); 
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
  };
};
