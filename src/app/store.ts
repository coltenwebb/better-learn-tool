import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import throttle from 'lodash.throttle';
import counterReducer from '../features/counter/counterSlice';
import appReducer from '../features/app/appSlice';

// some local storage solns
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('state');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

const saveState = (state: any) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('state', serializedState);
  } catch (err) {
    // Ignore write errors.
  }
};

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    app: appReducer,
  },
  preloadedState: loadState()
});


store.subscribe(throttle(() => {
  saveState(
    store.getState(),
  );
}, 1000));


export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
