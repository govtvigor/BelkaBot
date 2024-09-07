import { Branch } from '../reducers/gameReducer';

export const startGame = () => ({
    type: 'START_GAME' as const,
});

export const updateSpeed = () => ({
    type: 'UPDATE_SPEED' as const,
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

export const updateScrollOffset = (offset: number) => ({
    type: 'UPDATE_SCROLL_OFFSET' as const,
    payload: offset,
});

export const setLifeDeducted = (deducted: boolean) => ({
    type: 'SET_LIFE_DEDUCTED' as const,
    payload: deducted,
});

export const setSquirrelTop = (top: number) => ({
    type: 'SET_SQUIRREL_TOP' as const,
    payload: top,
});
