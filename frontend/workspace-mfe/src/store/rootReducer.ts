import { combineReducers } from '@reduxjs/toolkit';
import projectsReducer from './slices/projectsSlice';
import tasksReducer from './slices/tasksSlice';
import boardsReducer from './slices/boardsSlice';
import workflowsReducer from './slices/workflowsSlice';

const rootReducer = combineReducers({
  projects: projectsReducer,
  tasks: tasksReducer,
  boards: boardsReducer,
  workflows: workflowsReducer,
});

export default rootReducer;

