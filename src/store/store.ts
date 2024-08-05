import { configureStore } from "@reduxjs/toolkit";
import { boardSlice, tasksDBHandlerMiddleware } from "./slices";

export const store = configureStore({
  reducer: {
    board: boardSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(tasksDBHandlerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
