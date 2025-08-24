import { createSlice } from '@reduxjs/toolkit';

const defaultCategories = [
  // Income categories
  { id: 'salary', name: 'Salary', nameturkish: 'Maaş', type: 'income', color: '#4CAF50', isDefault: true },
  { id: 'freelance', name: 'Freelance', nameturkish: 'Serbest Çalışma', type: 'income', color: '#8BC34A', isDefault: true },
  { id: 'other-income', name: 'Other Income', nameturkish: 'Diğer Gelir', type: 'income', color: '#CDDC39', isDefault: true },
  
  // Expense categories
  { id: 'rent', name: 'Rent', nameturkish: 'Kira', type: 'expense', color: '#F44336', isDefault: true },
  { id: 'groceries', name: 'Groceries', nameturkish: 'Market', type: 'expense', color: '#E91E63', isDefault: true },
  { id: 'transportation', name: 'Transportation', nameturkish: 'Ulaşım', type: 'expense', color: '#9C27B0', isDefault: true },
  { id: 'utilities', name: 'Utilities', nameturkish: 'Faturalar', type: 'expense', color: '#673AB7', isDefault: true },
  { id: 'entertainment', name: 'Entertainment', nameturkish: 'Eğlence', type: 'expense', color: '#3F51B5', isDefault: true },
  { id: 'healthcare', name: 'Healthcare', nameTurkish: 'Sağlık', type: 'expense', color: '#2196F3', isDefault: true },
];

const initialState = {
  categories: defaultCategories,
  loading: false,
  error: null,
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    addCategory: (state, action) => {
      state.categories.push({
        id: Date.now().toString(),
        ...action.payload,
        isDefault: false,
        createdAt: new Date().toISOString(),
      });
    },
    updateCategory: (state, action) => {
      const index = state.categories.findIndex(c => c.id === action.payload.id);
      if (index !== -1 && !state.categories[index].isDefault) {
        state.categories[index] = { ...state.categories[index], ...action.payload };
      }
    },
    deleteCategory: (state, action) => {
      state.categories = state.categories.filter(c => c.id !== action.payload || c.isDefault);
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
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
  addCategory,
  updateCategory,
  deleteCategory,
  setCategories,
  setLoading,
  setError,
} = categoriesSlice.actions;

export default categoriesSlice.reducer;