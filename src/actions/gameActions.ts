// src/actions/gameActions.ts

import { Branch } from '../reducers/gameReducer';

export const startGame = () => ({ type: 'START_GAME' } as const);

export const updateSpeed = () => ({ type: 'UPDATE_SPEED' } as const);

export const decreaseTime = () => ({ type: 'DECREASE_TIME' } as const);

export const resetGame = () => ({ type: 'RESET_GAME' } as const); // Make sure this returns a valid action

export const deductLife = () => ({ type: 'DEDUCT_LIFE' } as const); // Make sure this returns a valid action

export const addPoints = (points: number) => ({ type: 'ADD_POINTS', payload: points } as const);

export const activateBonus = (isActive: boolean) => ({ type: 'BONUS_ACTIVE', payload: isActive } as const);

export const setMenu = (inMenu: boolean) => ({ type: 'SET_MENU', payload: inMenu } as const);

export const setSquirrelSide = (side: 'left' | 'right') => ({ type: 'SET_SQUIRREL_SIDE', payload: side } as const);

export const addBranch = (branch: Branch) => ({ type: 'ADD_BRANCH', payload: branch } as const);

export const removeBranch = () => ({ type: 'REMOVE_BRANCH' } as const);

export const updateScrollOffset = (offset: number) => ({ type: 'UPDATE_SCROLL_OFFSET', payload: offset } as const);
