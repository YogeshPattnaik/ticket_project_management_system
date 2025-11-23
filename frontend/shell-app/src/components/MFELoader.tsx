import React, { Suspense, lazy, ComponentType } from 'react';

interface MFELoaderProps {
  remote: string;
  module: string;
  fallback?: React.ReactNode;
}

// Map of remote names to their import functions
// Vite Module Federation requires static imports, so we map them here
// These are virtual modules created by Module Federation at runtime
const remoteImports: Record<string, Record<string, () => Promise<any>>> = {
  auth_mfe: {
    './App': () => import(/* @vite-ignore */ 'auth_mfe/App'),
    './Login': () => import(/* @vite-ignore */ 'auth_mfe/Login'),
    './Register': () => import(/* @vite-ignore */ 'auth_mfe/Register'),
  },
  workspace_mfe: {
    './App': () => import(/* @vite-ignore */ 'workspace_mfe/App'),
  },
  analytics_mfe: {
    './App': () => import(/* @vite-ignore */ 'analytics_mfe/App'),
  },
  admin_mfe: {
    './App': () => import(/* @vite-ignore */ 'admin_mfe/App'),
  },
};

// Simple, clean MFE loader using Vite Module Federation
export function MFELoader({ remote, module, fallback }: MFELoaderProps) {
  const LazyComponent = lazy(async () => {
    try {

      // Get the import function from our map
      const remoteMap = remoteImports[remote];
      if (!remoteMap) {
        throw new Error(`Remote ${remote} not found in import map`);
      }

      const importFn = remoteMap[module];
      if (!importFn) {
        throw new Error(`Module ${module} not found in remote ${remote}`);
      }

      // Use the mapped import function with retry
      let lastError: any;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const Component = await importFn();
          if (Component && Component.default) {
            return { default: Component.default as ComponentType<any> };
          }
        } catch (error) {
          lastError = error;
          if (attempt < 2) {
            await new Promise(resolve => setTimeout(resolve, 300 * (attempt + 1)));
          }
        }
      }
      
      throw lastError || new Error(`Failed to load ${module} from ${remote} after retries`);
    } catch (error) {
      console.error(`[MFELoader] Failed to load ${module} from ${remote}:`, error);
      // Return error component
      return {
        default: () => (
          <div className="p-8 text-center">
            <div className="text-red-600 mb-2">Failed to load {module}</div>
            <div className="text-sm text-gray-500">{String(error)}</div>
            <div className="text-xs text-gray-400 mt-2">
              Make sure all MFE dev servers are running (ports 3001-3004)
            </div>
          </div>
        ),
      };
    }
  });

  return (
    <Suspense fallback={fallback || <div className="p-8 text-center">Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
