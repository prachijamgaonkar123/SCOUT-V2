import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "scout.theme.mode";

const getInitialMode = (): ThemeMode => {
  if (typeof window === "undefined") return "light";
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* storage unavailable — keep default */
  }
  return "light";
};

interface ThemeState {
  mode: ThemeMode;
}

const initialState: ThemeState = {
  mode: getInitialMode(),
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      try {
        window.localStorage.setItem(STORAGE_KEY, action.payload);
      } catch {
        /* non-fatal */
      }
    },
    toggleThemeMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
      try {
        window.localStorage.setItem(STORAGE_KEY, state.mode);
      } catch {
        /* non-fatal */
      }
    },
  },
});

export const { setThemeMode, toggleThemeMode } = themeSlice.actions;
export default themeSlice.reducer;
