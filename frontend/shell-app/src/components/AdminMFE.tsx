'use client';

import { MFELoader } from './MFELoader';

export function AdminMFE() {
  // Use direct URL instead of proxy to avoid dependency resolution issues
  const remoteUrl = process.env.NODE_ENV === 'production' 
    ? '/mfe/admin/remoteEntry.js'
    : 'http://localhost:3004/remoteEntry.js';
  
  return (
    <MFELoader
      remoteName={remoteUrl}
      modulePath="./App"
      fallback={
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Admin Panel...</p>
          </div>
        </div>
      }
    />
  );
}

