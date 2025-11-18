import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Workflow } from '@task-management/interfaces';

interface WorkflowsState {
  workflows: Workflow[];
  selectedWorkflow: Workflow | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: WorkflowsState = {
  workflows: [],
  selectedWorkflow: null,
  isLoading: false,
  error: null,
};

const workflowsSlice = createSlice({
  name: 'workflows',
  initialState,
  reducers: {
    fetchWorkflowsStart: (state, action: PayloadAction<string>) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchWorkflowsSuccess: (state, action: PayloadAction<Workflow[]>) => {
      state.workflows = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    fetchWorkflowsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setSelectedWorkflow: (state, action: PayloadAction<Workflow | null>) => {
      state.selectedWorkflow = action.payload;
    },
  },
});

export const {
  fetchWorkflowsStart,
  fetchWorkflowsSuccess,
  fetchWorkflowsFailure,
  setSelectedWorkflow,
} = workflowsSlice.actions;

export default workflowsSlice.reducer;

