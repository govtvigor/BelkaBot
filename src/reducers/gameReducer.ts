import {
  START_GAME,
  UPDATE_SPEED,
  DECREASE_TIME,
  RESET_GAME,
  DEDUCT_LIFE,
  ADD_POINTS,
  BONUS_ACTIVE,
  SET_MENU,
  SET_SQUIRREL_SIDE,
  ADD_BRANCH,
  REMOVE_BRANCH,
  UPDATE_SCROLL_OFFSET,
  SET_LIFE_DEDUCTED,
  SET_SQUIRREL_TOP,
  SET_BRANCHES,
  startGame,
  updateSpeed,
  decreaseTime,
  resetGame,
  deductLife,
  addPoints,
  bonusActive,
  setMenu,
  setSquirrelSide,
  addBranch,
  removeBranch,
  updateScrollOffset,
  setLifeDeducted,
  setSquirrelTop,
  setBranches,
} from '../actions/gameActions';

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
  squirrelTop: number;
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
  squirrelTop: 500,
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
    | ReturnType<typeof setBranches>;

export const gameReducer = (
    state: GameState = initialState,
    action: GameAction
): GameState => {
  switch (action.type) {
    case START_GAME:
      return { ...state, gameStarted: true, inMenu: false };
    case UPDATE_SPEED:
      return { ...state, speed: Math.min(state.speed + 0.1, 40) };
    case DECREASE_TIME:
      return { ...state, timeLeft: state.timeLeft > 0 ? state.timeLeft - 1 : 0 };
    case RESET_GAME:
      return initialState;
    case DEDUCT_LIFE:
      return { ...state, lives: state.lives - 1, lifeDeducted: true };
    case ADD_POINTS:
      return { ...state, points: state.points + action.payload };
    case BONUS_ACTIVE:
      return { ...state, bonusActive: action.payload };
    case SET_MENU:
      return { ...state, inMenu: action.payload };
    case SET_SQUIRREL_SIDE:
      return { ...state, squirrelSide: action.payload };
    case ADD_BRANCH:
      return { ...state, branches: [...state.branches, action.payload] };
    case REMOVE_BRANCH:
      return { ...state, branches: state.branches.slice(1) };
    case UPDATE_SCROLL_OFFSET:
      return { ...state, scrollOffset: action.payload };
    case SET_LIFE_DEDUCTED:
      return { ...state, lifeDeducted: action.payload };
    case SET_SQUIRREL_TOP:
      return { ...state, squirrelTop: action.payload };
    case SET_BRANCHES:
      return { ...state, branches: action.payload };
    default:
      return state;
  }
};
