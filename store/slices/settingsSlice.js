import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  language: 'en', // 'en' or 'tr'
  currency: 'USD', // 'USD', 'EUR', 'TRY'
  theme: 'light', // 'light' or 'dark'
  notifications: true,
  loading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    setCurrency: (state, action) => {
      state.currency = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    updateSettings: (state, action) => {
      return { ...state, ...action.payload };
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setLanguage,
  setCurrency,
  setTheme,
  setNotifications,
  updateSettings,
  setLoading,
  setError,
} = settingsSlice.actions;

export default settingsSlice.reducer;