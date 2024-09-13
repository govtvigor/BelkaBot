// src/actions/gameActions.ts

import { Branch } from '../reducers/gameReducer';

export const START_GAME = 'START_GAME';
export const UPDATE_SPEED = 'UPDATE_SPEED';
export const DECREASE_TIME = 'DECREASE_TIME';
export const RESET_GAME = 'RESET_GAME';
export const DEDUCT_LIFE = 'DEDUCT_LIFE';
export const ADD_POINTS = 'ADD_POINTS';
export const BONUS_ACTIVE = 'BONUS_ACTIVE';
export const SET_MENU = 'SET_MENU';
export const SET_SQUIRREL_SIDE = 'SET_SQUIRREL_SIDE';
export const SET_BRANCHES = 'SET_BRANCHES';
export const ADD_BRANCH = 'ADD_BRANCH';
export const REMOVE_BRANCH = 'REMOVE_BRANCH';
export const UPDATE_SCROLL_OFFSET = 'UPDATE_SCROLL_OFFSET';
export const SET_LIFE_DEDUCTED = 'SET_LIFE_DEDUCTED';
export const SET_SQUIRREL_TOP = 'SET_SQUIRREL_TOP';

export type Side = 'left' | 'right';

export const startGame = () => ({
    type: START_GAME as typeof START_GAME,
});

export const updateSpeed = () => ({
    type: UPDATE_SPEED as typeof UPDATE_SPEED,
});

export const decreaseTime = () => ({
    type: DECREASE_TIME as typeof DECREASE_TIME,
});

export const resetGame = () => ({
    type: RESET_GAME as typeof RESET_GAME,
});

export const deductLife = () => ({
    type: DEDUCT_LIFE as typeof DEDUCT_LIFE,
});

export const addPoints = (points: number) => ({
    type: ADD_POINTS as typeof ADD_POINTS,
    payload: points,
});

export const bonusActive = (isActive: boolean) => ({
    type: BONUS_ACTIVE as typeof BONUS_ACTIVE,
    payload: isActive,
});

export const setMenu = (inMenu: boolean) => ({
    type: SET_MENU as typeof SET_MENU,
    payload: inMenu,
});

export const setSquirrelSide = (side: Side) => ({
    type: SET_SQUIRREL_SIDE as typeof SET_SQUIRREL_SIDE,
    payload: side,
});

export const setBranches = (branches: Branch[]) => ({
    type: SET_BRANCHES as typeof SET_BRANCHES,
    payload: branches,
});

export const addBranch = (branch: Branch) => ({
    type: ADD_BRANCH as typeof ADD_BRANCH,
    payload: branch,
});

export const removeBranch = () => ({
    type: REMOVE_BRANCH as typeof REMOVE_BRANCH,
});

export const updateScrollOffset = (offset: number) => ({
    type: UPDATE_SCROLL_OFFSET as typeof UPDATE_SCROLL_OFFSET,
    payload: offset,
});

export const setLifeDeducted = (deducted: boolean) => ({
    type: SET_LIFE_DEDUCTED as typeof SET_LIFE_DEDUCTED,
    payload: deducted,
});

export const setSquirrelTop = (top: number) => ({
    type: SET_SQUIRREL_TOP as typeof SET_SQUIRREL_TOP,
    payload: top,
});
