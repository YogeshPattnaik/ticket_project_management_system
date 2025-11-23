'use client';

import { useEffect, useState } from 'react';

interface WorkspaceWrapperProps {
  componentName: 'ProjectManagement' | 'KanbanBoard' | 'TaskList' | 'WorkflowDesigner';
  props?: any;
}

export function WorkspaceWrapper({ componentName, props }: WorkspaceWrapperProps) {
  const [Component, setComponent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to load workspace component from workspace-mfe
    const loadWorkspaceComponent = async () => {
      try {
        if (typeof window !== 'undefined') {
          // Wait for workspace-mfe to be loaded (it's loaded via single-spa)
          let attempts = 0;
          const maxAttempts = 10;
          
          const checkWorkspaceMfe = () => {
            const workspaceMfe = (window as any).workspaceMfe;
            
            if (workspaceMfe && workspaceMfe[componentName]) {
              setComponent(() => workspaceMfe[componentName]);
              return true;
            }
            
            return false;
          };

          // Check immediately
          if (checkWorkspaceMfe()) {
            return;
          }

          // Poll for workspace-mfe to load (it loads via single-spa)
          const interval = setInterval(() => {
            attempts++;
            if (checkWorkspaceMfe()) {
              clearInterval(interval);
            } else if (attempts >= maxAttempts) {
              clearInterval(interval);
              setError(`Workspace component "${componentName}" is not available. Make sure workspace-mfe is loaded.`);
            }
          }, 500);

          return () => clearInterval(interval);
        }
      } catch (err: any) {
        setError(`Failed to load ${componentName}: ${err.message}`);
      }
    };

    loadWorkspaceComponent();
  }, [componentName]);

  if (error) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-yellow-800">{error}</p>
        <p className="text-sm text-yellow-600 mt-2">
          Workspace features will be available here. For now, you can access them via the Workspace tab.
        </p>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workspace component...</p>
        </div>
      </div>
    );
  }

  return <Component {...props} />;
}

