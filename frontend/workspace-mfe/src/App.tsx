import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './store';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskList } from './components/TaskList';
import { ProjectManagement } from './components/ProjectManagement';
import { WorkflowDesigner } from './components/WorkflowDesigner';

const queryClient = new QueryClient();

function App() {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route
              path="/"
              element={
                <div className="app p-6">
                  <h1 className="text-2xl font-bold mb-4">Workspace</h1>
                  <div className="space-y-6">
                    <ProjectManagement />
                    <KanbanBoard />
                    <TaskList />
                    <WorkflowDesigner />
                  </div>
                </div>
              }
            />
            <Route path="/workspace/projects" element={<ProjectManagement />} />
            <Route path="/workspace/kanban" element={<KanbanBoard />} />
            <Route path="/workspace/tasks" element={<TaskList />} />
            <Route path="/workspace/workflows" element={<WorkflowDesigner />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ReduxProvider>
  );
}

export default App;
