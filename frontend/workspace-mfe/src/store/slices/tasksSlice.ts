import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TaskDto, CreateTaskDto, UpdateTaskDto } from '@task-management/dto';

interface TasksState {
  tasks: TaskDto[];
  selectedTask: TaskDto | null;
  filters: {
    projectId?: string;
    status?: string;
    assigneeId?: string;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  selectedTask: null,
  filters: {},
  isLoading: false,
  error: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    fetchTasksStart: (state, action: PayloadAction<{ projectId?: string; status?: string }>) => {
      state.isLoading = true;
      state.error = null;
      state.filters = action.payload;
    },
    fetchTasksSuccess: (state, action: PayloadAction<TaskDto[]>) => {
      state.tasks = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    fetchTasksFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    createTaskStart: (state, action: PayloadAction<CreateTaskDto>) => {
      state.isLoading = true;
      state.error = null;
    },
    createTaskSuccess: (state, action: PayloadAction<TaskDto>) => {
      state.tasks.push(action.payload);
      state.isLoading = false;
    },
    createTaskFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateTaskStart: (state, action: PayloadAction<{ id: string; data: UpdateTaskDto }>) => {
      state.isLoading = true;
      state.error = null;
    },
    updateTaskSuccess: (state, action: PayloadAction<TaskDto>) => {
      const index = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
      if (state.selectedTask?.id === action.payload.id) {
        state.selectedTask = action.payload;
      }
      state.isLoading = false;
    },
    updateTaskFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    deleteTaskStart: (state, action: PayloadAction<string>) => {
      state.isLoading = true;
      state.error = null;
    },
    deleteTaskSuccess: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
      if (state.selectedTask?.id === action.payload) {
        state.selectedTask = null;
      }
      state.isLoading = false;
    },
    deleteTaskFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    moveTaskStart: (state, action: PayloadAction<{ taskId: string; newStatus: string }>) => {
      // Optimistic update
      const task = state.tasks.find((t) => t.id === action.payload.taskId);
      if (task) {
        task.status = action.payload.newStatus;
      }
    },
    moveTaskSuccess: (state, action: PayloadAction<TaskDto>) => {
      const index = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    moveTaskFailure: (state, action: PayloadAction<{ taskId: string; error: string }>) => {
      state.error = action.payload.error;
      // Rollback would be handled by saga
    },
    setSelectedTask: (state, action: PayloadAction<TaskDto | null>) => {
      state.selectedTask = action.payload;
    },
  },
});

export const {
  fetchTasksStart,
  fetchTasksSuccess,
  fetchTasksFailure,
  createTaskStart,
  createTaskSuccess,
  createTaskFailure,
  updateTaskStart,
  updateTaskSuccess,
  updateTaskFailure,
  deleteTaskStart,
  deleteTaskSuccess,
  deleteTaskFailure,
  moveTaskStart,
  moveTaskSuccess,
  moveTaskFailure,
  setSelectedTask,
} = tasksSlice.actions;

export default tasksSlice.reducer;

