import {
  addBranch,
  addPoints,
  bonusActive,
  decreaseTime,
  deductLife,
  removeBranch,
  resetGame,
  setLifeDeducted,
  setMenu,
  setSquirrelSide, setSquirrelTop,
  startGame,
  updateScrollOffset,
  updateSpeed,
  setBranches,
  setScrollOffset,
  setGameOver,
  setLives
} from "../actions/gameActions";

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
  lives: number | null;
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
  squirrelTop: number;
  gameOver: boolean;
}

export const initialState: GameState = {
  gameStarted: false,
  lives: null,
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
  squirrelTop: 500,
  gameOver: false,
};

export type GameAction =
  | ReturnType<typeof startGame>
  | ReturnType<typeof updateSpeed>
  | ReturnType<typeof decreaseTime>
  | ReturnType<typeof resetGame>
  | ReturnType<typeof deductLife>
  | ReturnType<typeof addPoints>
  | ReturnType<typeof bonusActive>
  | ReturnType<typeof setMenu>
  | ReturnType<typeof setSquirrelSide>
  | ReturnType<typeof addBranch>
  | ReturnType<typeof removeBranch>
  | ReturnType<typeof updateScrollOffset>
  | ReturnType<typeof setLifeDeducted>
  | ReturnType<typeof setSquirrelTop>
  | ReturnType<typeof setScrollOffset>
  | ReturnType<typeof setBranches>
  | ReturnType<typeof setGameOver>
  | ReturnType<typeof setLives>;

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'START_GAME':
      return { ...state, gameStarted: true, inMenu: false, gameOver: false };
    case 'UPDATE_SPEED':
      return { ...state, speed: Math.min(state.speed + 0.1, 40) };
    case 'DECREASE_TIME':
      return { ...state, timeLeft: state.timeLeft > 0 ? state.timeLeft - 1 : 0 };
    case 'RESET_GAME':
      return { ...initialState, gameOver: true };
      case 'DEDUCT_LIFE':
        const currentLives = state.lives ?? 0; // If state.lives is null, default to 0
        const newLives = currentLives - 1;
        return {
          ...state,
          lives: newLives,
          lifeDeducted: true,
        };
      
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
      return { ...state, branches: state.branches.slice(0, -1) };
    case 'UPDATE_SCROLL_OFFSET':
      return { ...state, scrollOffset: action.payload };
    case 'SET_BRANCHES':
      return { ...state, branches: action.payload };
    case 'SET_SCROLL_OFFSET':
      return { ...state, scrollOffset: action.payload };
    case 'SET_LIFE_DEDUCTED':
      return { ...state, lifeDeducted: action.payload };
      case 'SET_LIVES':
  return { ...state, lives: action.payload };
      case 'SET_GAME_OVER':
  return { ...state, gameOver: action.payload };
    case 'SET_SQUIRREL_TOP': // Додано тут
      return { ...state, squirrelTop: action.payload };
    default:
      return state;
  }
};
