import { createSlice } from "@reduxjs/toolkit";
const walletBTSlice = createSlice({
  name: "walletBT",
  initialState: {
    currentAccountAddress: null,
    currentAccountPK: null,
    walletBTAccounts: null,
  },
  reducers: {
    setAddress: (state, action) => {
      state.currentAccountAddress = action.payload;
    },
    setPK: (state, action) => {
      state.currentAccountPK = action.payload;
    },
    setWalletBT: (state, action) => {
      state.walletBTAccounts = action.payload;
    },
  },
});
export const { setAddress, setPK, setWalletBT } = walletBTSlice.actions;
export default walletBTSlice.reducer;
