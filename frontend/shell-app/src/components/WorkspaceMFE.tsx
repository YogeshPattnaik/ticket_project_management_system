'use client';

import { MFELoader } from './MFELoader';

export function WorkspaceMFE() {
  // Use direct URL instead of proxy to avoid dependency resolution issues
  // The proxy causes relative imports in remoteEntry.js to resolve against proxy origin
  const remoteUrl = process.env.NODE_ENV === 'production' 
    ? '/mfe/workspace/remoteEntry.js'  // In production, use proxy/CDN
    : 'http://localhost:3002/remoteEntry.js';  // In dev, use direct URL (CORS enabled)
  
  return (
    <MFELoader
      remoteName={remoteUrl}
      modulePath="./App"
      fallback={
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Workspace...</p>
          </div>
        </div>
      }
    />
  );
}

