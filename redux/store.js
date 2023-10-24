import { createSlice, configureStore } from "@reduxjs/toolkit";

const selectedWorkout = createSlice({
  name: "selectedWorkout",
  initialState: {
    value: "-1",
  },
  reducers: {
    selectWorkout: (state, action) => {
      state.value = action.payload;
    },
  },
});
export const { selectWorkout } = selectedWorkout.actions;
//
const triggerEndSlice = createSlice({
  name: "triggerEndSlice",
  initialState: {
    value: false,
  },
  reducers: {
    triggerEnd: (state, action) => {
      state.value = !state.value;
    },
  },
});
export const { triggerEnd } = triggerEndSlice.actions;

export const store = configureStore({
  reducer: {
    selectedWorkout: selectedWorkout.reducer,
    triggerEndSlice: triggerEndSlice.reducer,
  },
});

