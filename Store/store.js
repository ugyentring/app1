import { configureStore } from "@reduxjs/toolkit";
import walletBTSlice from "./walletBTSlice";
export const store = configureStore({
  reducer: {
    walletBT: walletBTSlice,
  },
});
