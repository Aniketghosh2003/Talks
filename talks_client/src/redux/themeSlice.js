import { createSlice } from "@reduxjs/toolkit";

export const themeSlice = createSlice({
  name: "themeSlice",
  initialState: localStorage.getItem("theme") === "dark" ? false : true, // Load from localStorage
  reducers: {
    toggleTheme: (state) => {
      const newState = !state;
      // Save to localStorage whenever it changes
      localStorage.setItem("theme", newState ? "light" : "dark");
      return newState;
    },
  },
});

export const { toggleTheme } = themeSlice.actions;

export default themeSlice.reducer;
