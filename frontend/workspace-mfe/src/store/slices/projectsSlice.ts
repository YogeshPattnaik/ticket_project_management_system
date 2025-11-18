import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProjectDto, CreateProjectDto, UpdateProjectDto } from '@task-management/dto';

interface ProjectsState {
  projects: ProjectDto[];
  selectedProject: ProjectDto | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  selectedProject: null,
  isLoading: false,
  error: null,
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    fetchProjectsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchProjectsSuccess: (state, action: PayloadAction<ProjectDto[]>) => {
      state.projects = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    fetchProjectsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    createProjectStart: (state, action: PayloadAction<CreateProjectDto>) => {
      state.isLoading = true;
      state.error = null;
    },
    createProjectSuccess: (state, action: PayloadAction<ProjectDto>) => {
      state.projects.push(action.payload);
      state.isLoading = false;
    },
    createProjectFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateProjectStart: (state, action: PayloadAction<{ id: string; data: UpdateProjectDto }>) => {
      state.isLoading = true;
      state.error = null;
    },
    updateProjectSuccess: (state, action: PayloadAction<ProjectDto>) => {
      const index = state.projects.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
      if (state.selectedProject?.id === action.payload.id) {
        state.selectedProject = action.payload;
      }
      state.isLoading = false;
    },
    updateProjectFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setSelectedProject: (state, action: PayloadAction<ProjectDto | null>) => {
      state.selectedProject = action.payload;
    },
  },
});

export const {
  fetchProjectsStart,
  fetchProjectsSuccess,
  fetchProjectsFailure,
  createProjectStart,
  createProjectSuccess,
  createProjectFailure,
  updateProjectStart,
  updateProjectSuccess,
  updateProjectFailure,
  setSelectedProject,
} = projectsSlice.actions;

export default projectsSlice.reducer;

