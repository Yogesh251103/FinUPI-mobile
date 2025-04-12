import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CreditState {
  creditScore: number;
  maxLoanAmount: number;
  maxLoanDuration: number;
  scoreCategory: string;
  lastUpdated: string;
}

const initialState: CreditState = {
  creditScore: 0,
  maxLoanAmount: 5000,
  maxLoanDuration: 36,
  scoreCategory: 'Unknown',
  lastUpdated: new Date().toISOString(),
};

export const creditSlice = createSlice({
  name: 'credit',
  initialState,
  reducers: {
    setCreditScore: (state, action: PayloadAction<number>) => {
      state.creditScore = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    setMaxLoanAmount: (state, action: PayloadAction<number>) => {
      state.maxLoanAmount = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    setMaxLoanDuration: (state, action: PayloadAction<number>) => {
      state.maxLoanDuration = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    setScoreCategory: (state, action: PayloadAction<string>) => {
      state.scoreCategory = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    updateCreditInfo: (state, action: PayloadAction<Partial<CreditState>>) => {
      return { ...state, ...action.payload, lastUpdated: new Date().toISOString() };
    },
  },
});

export const { setCreditScore, setMaxLoanAmount, setMaxLoanDuration, setScoreCategory, updateCreditInfo } = creditSlice.actions;

export default creditSlice.reducer; 