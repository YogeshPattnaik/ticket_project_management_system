# State Management Guide - Redux Toolkit, Redux Saga & Zustand

This project uses a **hybrid state management approach** combining Redux Toolkit, Redux Saga, and Zustand for optimal performance and developer experience.

## State Management Strategy

### When to Use Redux Toolkit + Redux Saga

**Use Redux Toolkit for:**
- ✅ Complex global state shared across multiple components
- ✅ State that needs time-travel debugging
- ✅ State requiring middleware (logging, persistence)
- ✅ Complex async flows requiring orchestration
- ✅ State that needs to be serialized/persisted
- ✅ State with complex update logic

**Use Redux Saga for:**
- ✅ Complex async flows (API calls with multiple steps)
- ✅ Side effects (WebSocket connections, token refresh)
- ✅ Orchestrating multiple API calls
- ✅ Handling race conditions
- ✅ Retry logic and error recovery
- ✅ Background tasks

**Examples:**
- Authentication state (user, tokens)
- Projects and tasks state
- Kanban boards state
- Workflows state
- Global UI state (theme, notifications)

### When to Use Zustand

**Use Zustand for:**
- ✅ Simple local component state
- ✅ UI state (modals, dropdowns, form state)
- ✅ Quick prototyping
- ✅ Component-specific state that doesn't need global access
- ✅ Minimal boilerplate needed

**Examples:**
- Modal open/close state
- Dropdown visibility
- Form input state (before submission)
- Component-level UI state

### When to Use React Query

**Use React Query for:**
- ✅ Server state management
- ✅ API data caching
- ✅ Automatic refetching
- ✅ Optimistic updates
- ✅ Background synchronization

**Examples:**
- API data fetching
- Cached server responses
- Automatic refetch on window focus
- Pagination and infinite scroll

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Component Layer                        │
│  (React Components using hooks)                          │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
│ Redux Toolkit│  │   Zustand     │  │ React Query  │
│  + Saga      │  │               │  │              │
│              │  │               │  │              │
│ Global State│  │ Local State   │  │ Server State │
│ Complex Flows│  │ Simple State  │  │ API Cache    │
└──────────────┘  └───────────────┘  └──────────────┘
```

## Redux Toolkit Setup

### Store Configuration

```typescript
// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './rootReducer';
import rootSaga from './rootSaga';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false, // Using Saga instead of Thunk
    }).concat(sagaMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

sagaMiddleware.run(rootSaga);
```

### Creating a Slice

```typescript
// src/store/slices/tasksSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TaskDto } from '@task-management/dto';

interface TasksState {
  tasks: TaskDto[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  isLoading: false,
  error: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    fetchTasksStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchTasksSuccess: (state, action: PayloadAction<TaskDto[]>) => {
      state.tasks = action.payload;
      state.isLoading = false;
    },
    fetchTasksFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchTasksStart, fetchTasksSuccess, fetchTasksFailure } =
  tasksSlice.actions;
export default tasksSlice.reducer;
```

### Creating a Saga

```typescript
// src/store/sagas/tasksSaga.ts
import { call, put, takeLatest } from 'redux-saga/effects';
import { apiClient } from '@task-management/shared-ui';
import { fetchTasksStart, fetchTasksSuccess, fetchTasksFailure } from '../slices/tasksSlice';

function* fetchTasksSaga(action: ReturnType<typeof fetchTasksStart>) {
  try {
    const response: { data: { data: TaskDto[] } } = yield call(
      apiClient.get,
      '/api/v1/tasks'
    );
    yield put(fetchTasksSuccess(response.data.data || []));
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || 'Failed to fetch tasks';
    yield put(fetchTasksFailure(errorMessage));
  }
}

export default function* tasksSaga() {
  yield takeLatest('tasks/fetchTasksStart', fetchTasksSaga);
}
```

### Using Redux in Components

```typescript
// src/components/TaskList.tsx
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchTasksStart } from '@/store/slices/tasksSlice';
import { useEffect } from 'react';

export const TaskList = () => {
  const dispatch = useAppDispatch();
  const { tasks, isLoading, error } = useAppSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchTasksStart());
  }, [dispatch]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {tasks.map((task) => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  );
};
```

## Redux Saga Patterns

### Basic API Call

```typescript
function* fetchDataSaga() {
  try {
    const response = yield call(apiClient.get, '/api/v1/data');
    yield put(fetchDataSuccess(response.data));
  } catch (error) {
    yield put(fetchDataFailure(error.message));
  }
}
```

### Multiple API Calls (Sequential)

```typescript
function* fetchUserDataSaga(action: PayloadAction<string>) {
  try {
    const user = yield call(apiClient.get, `/api/v1/users/${action.payload}`);
    const projects = yield call(apiClient.get, `/api/v1/users/${action.payload}/projects`);
    
    yield put(fetchUserDataSuccess({ user, projects }));
  } catch (error) {
    yield put(fetchUserDataFailure(error.message));
  }
}
```

### Multiple API Calls (Parallel)

```typescript
import { all, call } from 'redux-saga/effects';

function* fetchDashboardDataSaga() {
  try {
    const [projects, tasks, notifications] = yield all([
      call(apiClient.get, '/api/v1/projects'),
      call(apiClient.get, '/api/v1/tasks'),
      call(apiClient.get, '/api/v1/notifications'),
    ]);
    
    yield put(fetchDashboardDataSuccess({ projects, tasks, notifications }));
  } catch (error) {
    yield put(fetchDashboardDataFailure(error.message));
  }
}
```

### Optimistic Updates

```typescript
function* moveTaskSaga(action: PayloadAction<{ taskId: string; newStatus: string }>) {
  // Optimistic update
  yield put(moveTaskStart(action.payload));
  
  try {
    const response = yield call(
      apiClient.post,
      `/api/v1/tasks/${action.payload.taskId}/move`,
      { status: action.payload.newStatus }
    );
    
    yield put(moveTaskSuccess(response.data.data));
  } catch (error) {
    // Rollback on error
    yield put(moveTaskFailure({ taskId: action.payload.taskId, error: error.message }));
  }
}
```

### Retry Logic

```typescript
import { delay } from 'redux-saga/effects';

function* fetchWithRetrySaga(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = yield call(apiClient.get, '/api/v1/data');
      return response.data;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      yield delay(1000 * (i + 1)); // Exponential backoff
    }
  }
}
```

### WebSocket Integration

```typescript
import { eventChannel } from 'redux-saga';
import io from 'socket.io-client';

function createSocketChannel(socket) {
  return eventChannel((emit) => {
    socket.on('notification', (data) => {
      emit({ type: 'NOTIFICATION_RECEIVED', payload: data });
    });
    
    return () => socket.disconnect();
  });
}

function* watchSocketSaga() {
  const socket = io(WS_URL);
  const channel = yield call(createSocketChannel, socket);
  
  while (true) {
    const event = yield take(channel);
    yield put(event);
  }
}
```

## Zustand Setup

### Creating a Store

```typescript
// src/stores/modalStore.ts
import { create } from 'zustand';

interface ModalState {
  isOpen: boolean;
  content: React.ReactNode | null;
  open: (content: React.ReactNode) => void;
  close: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  content: null,
  open: (content) => set({ isOpen: true, content }),
  close: () => set({ isOpen: false, content: null }),
}));
```

### Using Zustand in Components

```typescript
// src/components/Modal.tsx
import { useModalStore } from '@/stores/modalStore';

export const Modal = () => {
  const { isOpen, content, close } = useModalStore();
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {content}
      </div>
    </div>
  );
};
```

## React Query Setup

### Basic Usage

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@task-management/shared-ui';

// Query
const { data, isLoading, error } = useQuery({
  queryKey: ['tasks', projectId],
  queryFn: () => apiClient.get(`/api/v1/tasks?projectId=${projectId}`),
});

// Mutation
const mutation = useMutation({
  mutationFn: (data: CreateTaskDto) => apiClient.post('/api/v1/tasks', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  },
});
```

## Best Practices

### 1. State Management Selection

```
Complex Global State → Redux Toolkit + Saga
Simple UI State → Zustand
Server State → React Query
```

### 2. Redux Saga Best Practices

- Use `takeLatest` for actions that can be triggered multiple times
- Use `takeEvery` for actions that should all be processed
- Use `call` for API calls and async operations
- Use `put` for dispatching actions
- Use `all` for parallel operations
- Handle errors properly with try/catch

### 3. Zustand Best Practices

- Keep stores small and focused
- Use TypeScript for type safety
- Avoid storing derived state (compute in components)
- Use selectors to prevent unnecessary re-renders

### 4. React Query Best Practices

- Use descriptive query keys
- Set appropriate staleTime and cacheTime
- Use mutations for data modifications
- Invalidate queries after mutations

## Examples by Module

### Shell App

**Redux Toolkit:**
- `authSlice` - Authentication state
- `uiSlice` - Global UI state (theme, sidebar, notifications)

**Redux Saga:**
- `authSaga` - Login, register, token refresh flows
- `uiSaga` - Notification auto-removal

### Workspace MFE

**Redux Toolkit:**
- `projectsSlice` - Projects state
- `tasksSlice` - Tasks state
- `boardsSlice` - Kanban boards state
- `workflowsSlice` - Workflows state

**Redux Saga:**
- `projectsSaga` - Project CRUD operations
- `tasksSaga` - Task CRUD, move operations
- `boardsSaga` - Board updates
- `workflowsSaga` - Workflow execution

**Zustand:**
- Modal state
- Form state
- Dropdown state

### Auth MFE

**Redux Toolkit:**
- `authSlice` - Auth state (if not using shell app's)

**Redux Saga:**
- `authSaga` - Login, register flows

**Zustand:**
- Form input state
- Modal visibility

## Migration Guide

### From Zustand to Redux

If you need to move state from Zustand to Redux:

1. Create a Redux slice
2. Create a saga for async operations
3. Update components to use Redux hooks
4. Remove Zustand store

### From Redux to Zustand

If state is too simple for Redux:

1. Create Zustand store
2. Update components
3. Remove Redux slice and saga

---

**For more details, see:**
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Redux Saga Documentation](https://redux-saga.js.org/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Query Documentation](https://tanstack.com/query/latest)

