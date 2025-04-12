import { configureStore } from '@reduxjs/toolkit';
import creditReducer from './slices/creditSlice';

export const store = configureStore({
  reducer: {
    credit: creditReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 