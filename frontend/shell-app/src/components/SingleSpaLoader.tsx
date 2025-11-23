import { useEffect, useRef } from 'react';

interface SingleSpaLoaderProps {
  appName: string;
  containerId: string;
}

export function SingleSpaLoader({ appName, containerId }: SingleSpaLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure container has the correct ID immediately
    if (containerRef.current) {
      containerRef.current.id = containerId;
      console.log(`[SingleSpaLoader] Container created: ${containerId}`, containerRef.current);
      
      // Also set it as a data attribute for easier finding
      containerRef.current.setAttribute('data-mfe-container', appName);
    }
  }, [containerId, appName]);

  // Set ID immediately in render, not just in useEffect
  return (
    <div 
      ref={containerRef} 
      id={containerId} 
      className="w-full h-full min-h-[400px]"
      data-app-name={appName}
      data-mfe-container={appName}
    />
  );
}

