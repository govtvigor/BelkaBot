import { Branch } from '../reducers/gameReducer';

export const startGame = () => ({
    type: 'START_GAME' as const,
});

export const setBranches = (branches: Branch[]) => ({
    type: 'SET_BRANCHES' as const,
    payload: branches,
});

export const updateSpeed = () => ({
    type: 'UPDATE_SPEED' as const,
});
export const setLives = (lives: number) => ({
    type: 'SET_LIVES' as const,
    payload: lives,
  });

export const decreaseTime = () => ({
    type: 'DECREASE_TIME' as const,
});

export const resetGame = () => ({
    type: 'RESET_GAME' as const,
});

export const deductLife = () => ({
    type: 'DEDUCT_LIFE' as const,
});

export const addPoints = (points: number) => ({
    type: 'ADD_POINTS' as const,
    payload: points,
});

export const bonusActive = (isActive: boolean) => ({
    type: 'BONUS_ACTIVE' as const,
    payload: isActive,
});

export const setMenu = (inMenu: boolean) => ({
    type: 'SET_MENU' as const,
    payload: inMenu,
});

export const setSquirrelSide = (side: 'left' | 'right') => ({
    type: 'SET_SQUIRREL_SIDE' as const,
    payload: side,
});

export const addBranch = (branch: Branch) => ({
    type: 'ADD_BRANCH' as const,
    payload: branch,
});

export const removeBranch = () => ({
    type: 'REMOVE_BRANCH' as const,
});
export const setLivesLoading = (isLoading: boolean) => ({
    type: 'SET_LIVES_LOADING' as const,
    payload: isLoading,
  });

export const updateScrollOffset = (offset: number) => ({
    type: 'UPDATE_SCROLL_OFFSET' as const,
    payload: offset,
});
export const setTimeLeft = (time: number) => ({
    type: 'SET_TIME_LEFT' as const,
    payload: time,
  });

export const setLifeDeducted = (deducted: boolean) => ({
    type: 'SET_LIFE_DEDUCTED' as const,
    payload: deducted,
});
export const setScrollOffset = (offset: number) => ({
    type: 'SET_SCROLL_OFFSET' as const,
    payload: offset,
  });


export const setGameOver = (isGameOver: boolean) => ({
    type: 'SET_GAME_OVER' as const,
    payload: isGameOver,
  });
  
  
