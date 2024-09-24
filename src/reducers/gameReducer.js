"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameReducer = exports.initialState = void 0;
exports.initialState = {
    gameStarted: false,
    lives: 3,
    points: 0,
    speed: 5,
    bonusActive: false,
    timeLeft: 20,
    inMenu: true,
    squirrelSide: 'right',
    branches: [],
    scrollOffset: 0,
    bonuses: [],
    lifeDeducted: false,
    gameOver: false,
    isLivesLoading: true,
    currentBranchIndex: 5,
};
var gameReducer = function (state, action) {
    var _a;
    switch (action.type) {
        case 'START_GAME':
            return __assign(__assign({}, state), { gameStarted: true, inMenu: false, gameOver: false });
        case 'UPDATE_SPEED':
            return __assign(__assign({}, state), { speed: Math.min(state.speed + 0.1, 40) });
        case 'SET_TIME_LEFT':
            return __assign(__assign({}, state), { timeLeft: action.payload });
        case 'DECREASE_TIME':
            return __assign(__assign({}, state), { timeLeft: Math.max(state.timeLeft - 1, 0) });
        case 'RESET_GAME':
            return __assign(__assign({}, state), { gameStarted: false, gameOver: false, points: 0, timeLeft: exports.initialState.timeLeft, squirrelSide: exports.initialState.squirrelSide, branches: exports.initialState.branches, scrollOffset: exports.initialState.scrollOffset, bonuses: exports.initialState.bonuses, lifeDeducted: exports.initialState.lifeDeducted, 
                // squirrelTop: initialState.squirrelTop,
                inMenu: exports.initialState.inMenu });
        case 'DEDUCT_LIFE':
            var currentLives = (_a = state.lives) !== null && _a !== void 0 ? _a : 0; // If state.lives is null, default to 0
            var newLives = currentLives - 1;
            return __assign(__assign({}, state), { lives: newLives, lifeDeducted: true });
        case 'ADD_POINTS':
            return __assign(__assign({}, state), { points: state.points + action.payload });
        case 'BONUS_ACTIVE':
            return __assign(__assign({}, state), { bonusActive: action.payload });
        case 'SET_MENU':
            return __assign(__assign({}, state), { inMenu: action.payload });
        case 'SET_SQUIRREL_SIDE':
            return __assign(__assign({}, state), { squirrelSide: action.payload });
        case 'ADD_BRANCH':
            return __assign(__assign({}, state), { branches: __spreadArray([action.payload], state.branches, true) });
        case 'REMOVE_BRANCH':
            return __assign(__assign({}, state), { branches: state.branches.slice(0, -1) });
        case 'SET_BRANCHES':
            return __assign(__assign({}, state), { branches: action.payload });
        case 'UPDATE_SCROLL_OFFSET':
            return __assign(__assign({}, state), { scrollOffset: action.payload });
        case 'SET_SCROLL_OFFSET':
            return __assign(__assign({}, state), { scrollOffset: action.payload });
        case 'SET_LIFE_DEDUCTED':
            return __assign(__assign({}, state), { lifeDeducted: action.payload });
        case 'SET_LIVES':
            return __assign(__assign({}, state), { lives: action.payload });
        case 'SET_LIVES_LOADING':
            return __assign(__assign({}, state), { isLivesLoading: action.payload });
        case 'SET_GAME_OVER':
            return __assign(__assign({}, state), { gameOver: action.payload });
        case 'SET_CURRENT_BRANCH_INDEX':
            return __assign(__assign({}, state), { currentBranchIndex: action.payload });
        default:
            return state;
    }
};
exports.gameReducer = gameReducer;
