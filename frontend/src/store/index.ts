import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import { tasksApi } from './api/tasksApi';
import { workspacesApi } from './api/workspacesApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [tasksApi.reducerPath]: tasksApi.reducer,
    [workspacesApi.reducerPath]: workspacesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(tasksApi.middleware)
      .concat(workspacesApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;