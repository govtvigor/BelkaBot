import { useReducer, useCallback } from 'react';
import { gameReducer, initialState } from '../reducers/gameReducer';
import {
  startGame,
  resetGame,
  deductLife,
  addPoints,
  setSquirrelSide,
  setBranches,
  setGameOver,
  setSquirrelTop
} from '../actions/gameActions';

export const useGameLogic = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Generate initial branches
  const generateBranches = useCallback(() => {
    const newBranches = [];
    for (let i = 0; i < 5; i++) {
      const side: 'left' | 'right' = Math.random() > 0.5 ? 'left' : 'right';
      const top = i * 120 + 120;
      newBranches.push({ side, top });
    }
    dispatch(setBranches(newBranches));
  }, [dispatch]);

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
  
        // Add a new branch at the top
        const newSide: 'left' | 'right' = Math.random() > 0.5 ? 'left' : 'right';
        const newBranch = { side: newSide, top: -120 }; // Start above the visible area
        newBranches = [newBranch, ...newBranches];
  
        // Move all branches downward
        newBranches = newBranches.map((branch) => ({
          ...branch,
          top: branch.top + 120, // Move each branch down by 120px
        }));
  
        // Update the branches in the state
        dispatch(setBranches(newBranches));
      } else {
        dispatch(deductLife());
  
        // End the game immediately after one incorrect click
        dispatch(setGameOver(true));
        alert('Game over! Incorrect branch clicked.');
      }
    },
    [state.branches, dispatch, state.gameOver]
  );
  
  

  // Start game
  const handleGameStart = useCallback(() => {
    dispatch(startGame());
    generateBranches();
  }, [dispatch, generateBranches]);

  // Reset game
  const resetGameHandler = useCallback(() => {
    dispatch(resetGame());
    dispatch(setGameOver(false));
    dispatch(setSquirrelTop(500)); // Reset to initial position
  }, [dispatch]);

  return {
    state,
    handleGameStart,
    handleScreenClick,
    resetGame: resetGameHandler,
  };
};
