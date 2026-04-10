import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Activity } from '../types';

interface ActivityState {
  activities: Activity[];
}

const initialState: ActivityState = {
  activities: [],
};

const activitySlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    addActivity: (state, action: PayloadAction<Activity>) => {
      state.activities.unshift(action.payload);
    },
    deleteActivity: (state, action: PayloadAction<string>) => {
      state.activities = state.activities.filter(a => a.id !== action.payload);
    },
    clearActivities: (state) => {
      state.activities = [];
    },
  },
});

export const { addActivity, deleteActivity, clearActivities } = activitySlice.actions;
export default activitySlice.reducer;
