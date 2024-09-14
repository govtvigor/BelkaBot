import { useReducer, useCallback, useEffect, useContext, useRef, useState } from 'react';
import { gameReducer, initialState } from '../reducers/gameReducer';
import { setTimeLeft, decreaseTime } from '../actions/gameActions';
import { ChatIdContext } from '../client/App';
import { achievements } from '../constants/achievements';
import {
  updateUserLives,
  getUserLives,
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
  setGameOver,
  setLives,
  setLivesLoading
} from '../actions/gameActions';


export const useGameLogic = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const userChatId = useContext(ChatIdContext);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [userAchievements, setUserAchievements] = useState<string[]>([]);
  useEffect(() => {
    if (state.gameStarted && !state.gameOver) {
      timerRef.current = setInterval(() => {
        dispatch(decreaseTime());
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.gameStarted, state.gameOver, dispatch]);
  
  const generateBranches = useCallback(() => {
    const newBranches = [];
    const spacing = 120; // Define spacing between branches
    for (let i = 0; i < 6; i++) {
      const side: 'left' | 'right' = Math.random() > 0.5 ? 'left' : 'right';
      const top = i * spacing; // Start from 0 and use consistent spacing
      newBranches.push({ side, top });
    }
    dispatch(setBranches(newBranches));
  }, [dispatch]);

  // In your useGameLogic.ts
  useEffect(() => {
    const fetchLives = async () => {
      if (userChatId) {
        try {
          const livesFromDB = await getUserLives(userChatId);
          if (livesFromDB !== undefined) {
            dispatch(setLives(livesFromDB));
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
  
    dispatch(setGameOver(true));
    alert('Game over! Incorrect branch clicked.');
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

        // Remove the top branch
        let newBranches = state.branches.slice(0, -1);
        const timeIncrement = Math.max(0.05, 0.5 - (state.points / 100));
        dispatch(setTimeLeft(state.timeLeft + timeIncrement));

        // Add a new branch at the top
        const newSide: 'left' | 'right' = Math.random() > 0.5 ? 'left' : 'right';
        const newBranch = { side: newSide, top: 0 }; // Start at top position 0
        newBranches = [newBranch, ...newBranches];

        // Update top positions of all branches
        const spacing = 120; // Ensure consistent spacing
        newBranches = newBranches.map((branch, index) => ({
          ...branch,
          top: index * spacing,
        }));

        // Update the branches in the state
        dispatch(setBranches(newBranches));
      } else {
        handleGameOver();
      }
    },
    [state.branches, state.gameOver, dispatch, handleGameOver]
  );

  // Handle game over


  // Start game
  const handleGameStart = useCallback(() => {
    dispatch(startGame());
    generateBranches();
  }, [dispatch, generateBranches]);

  // Reset game
  const resetGameHandler = useCallback(() => {
    dispatch(resetGame());
    dispatch(setGameOver(false));
    // Optionally, generate new branches
  }, [dispatch]);

  // Generate initial branches


  return {
    state,
    handleGameStart,
    handleScreenClick,
    resetGame: resetGameHandler,
  };
};
