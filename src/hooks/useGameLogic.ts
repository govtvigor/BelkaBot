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
} from '../actions/gameActions';

export const useGameLogic = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Generate initial branches
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
        dispatch(deductLife());
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
  }, [dispatch]);

  return {
    state,
    handleGameStart,
    handleScreenClick,
    resetGame: resetGameHandler,
  };
};
