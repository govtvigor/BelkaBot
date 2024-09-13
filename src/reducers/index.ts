// src/reducers/index.ts

import { combineReducers } from 'redux';
import { gameReducer } from './gameReducer';

const rootReducer = combineReducers({
    game: gameReducer,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
