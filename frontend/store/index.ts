import { configureStore } from "@reduxjs/toolkit";
import assignmentReducer from "./slices/assignmentSlice";
import paperReducer from "./slices/paperSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    assignments: assignmentReducer,
    paper: paperReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore file objects in formData wrapper and async thunk arguments (FormData)
        ignoredPaths: ["paper.formData.file"],
        ignoredActionPaths: ["payload.file", "meta.arg"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

