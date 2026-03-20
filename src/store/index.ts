import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { Platform } from 'react-native';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import storageWeb from 'redux-persist/lib/storage';
import { api } from '@/src/services/api';
import activityReducer from './activitySlice';

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  activities: activityReducer,
});

const persistConfig = {
  key: 'root',
  storage: Platform.OS === 'web' ? storageWeb : AsyncStorage,
  whitelist: ['activities'], // only persist activity history
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist
    }).concat(api.middleware),
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
