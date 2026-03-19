import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Activity {
  id: string;
  title: string;
  date: number;
  distance: number; // in meters
  duration: number; // in seconds
  elevation: number; // in meters (mocked or calculated)
  path: { latitude: number; longitude: number; timestamp: number }[];
  type: 'run' | 'ride' | 'hike';
}

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
