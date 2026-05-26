import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AssignmentStatus, JobEvent } from '@shared/types';

interface JobState {
  status: AssignmentStatus;
  progress: number;
  message?: string;
  paperId?: string;
  error?: string;
}

interface JobsSliceState {
  byAssignment: Record<string, JobState>;
}

const initialState: JobsSliceState = { byAssignment: {} };

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    ingestEvent(state, action: PayloadAction<{ assignmentId: string; event: JobEvent }>) {
      const { assignmentId, event } = action.payload;
      const existing = state.byAssignment[assignmentId] || {
        status: 'queued',
        progress: 0,
      };
      if (event.type === 'status') {
        existing.status = event.status;
        existing.progress = event.progress;
        existing.message = event.message;
      } else if (event.type === 'completed') {
        existing.status = 'completed';
        existing.progress = 100;
        existing.paperId = event.paperId;
      } else if (event.type === 'error') {
        existing.status = 'failed';
        existing.error = event.message;
      }
      state.byAssignment[assignmentId] = existing;
    },
    resetJob(state, action: PayloadAction<string>) {
      delete state.byAssignment[action.payload];
    },
  },
});

export const { ingestEvent, resetJob } = jobsSlice.actions;
export default jobsSlice.reducer;
