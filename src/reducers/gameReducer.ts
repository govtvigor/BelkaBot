// src/reducers/gameReducer.ts

export interface Branch {
  side: 'left' | 'right';
  top: number;
}

export interface Bonus {
  top: number;
  side: 'left' | 'right';
}

export interface GameState {
  gameStarted: boolean;
  lives: number;
  points: number;
  speed: number;
  bonusActive: boolean;
  timeLeft: number;
  inMenu: boolean;
  squirrelSide: 'left' | 'right';
  branches: Branch[];
  scrollOffset: number;
  bonuses: Bonus[];
  lifeDeducted: boolean;
}

export const initialState: GameState = {
  gameStarted: false,
  lives: 3,
  points: 0,
  speed: 5,
  bonusActive: false,
  timeLeft: 30,
  inMenu: true,
  squirrelSide: 'right',
  branches: [],
  scrollOffset: 0,
  bonuses: [],
  lifeDeducted: false,
};

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'UPDATE_SPEED' }
  | { type: 'DECREASE_TIME' }
  | { type: 'RESET_GAME' }
  | { type: 'DEDUCT_LIFE' }
  | { type: 'ADD_POINTS'; payload: number }
  | { type: 'BONUS_ACTIVE'; payload: boolean }
  | { type: 'SET_MENU'; payload: boolean }
  | { type: 'SET_SQUIRREL_SIDE'; payload: 'left' | 'right' }
  | { type: 'ADD_BRANCH'; payload: Branch }
  | { type: 'REMOVE_BRANCH' }
  | { type: 'UPDATE_SCROLL_OFFSET'; payload: number }
  | { type: 'SET_LIFE_DEDUCTED'; payload: boolean };

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'START_GAME':
      return { ...state, gameStarted: true, inMenu: false };
    case 'UPDATE_SPEED':
      return { ...state, speed: Math.min(state.speed + 0.1, 40) };
    case 'DECREASE_TIME':
      return { ...state, timeLeft: state.timeLeft > 0 ? state.timeLeft - 1 : 0 };
    case 'RESET_GAME':
      return initialState;
    case 'DEDUCT_LIFE':
      return { ...state, lives: state.lives - 1, lifeDeducted: true };
    case 'ADD_POINTS':
      return { ...state, points: state.points + action.payload };
    case 'BONUS_ACTIVE':
      return { ...state, bonusActive: action.payload };
    case 'SET_MENU':
      return { ...state, inMenu: action.payload };
    case 'SET_SQUIRREL_SIDE':
      return { ...state, squirrelSide: action.payload };
    case 'ADD_BRANCH':
      return { ...state, branches: [...state.branches, action.payload] };
    case 'REMOVE_BRANCH':
      return { ...state, branches: state.branches.slice(1) };
    case 'UPDATE_SCROLL_OFFSET':
      return { ...state, scrollOffset: action.payload };
    case 'SET_LIFE_DEDUCTED':
      return { ...state, lifeDeducted: action.payload };
    default:
      return state;
  }
};
