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
  },
});

export const { addActivity } = activitySlice.actions;
export default activitySlice.reducer;
