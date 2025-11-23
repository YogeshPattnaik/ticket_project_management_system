/**
 * Loads a Vite MFE module for single-spa
 * Uses a script tag approach to load microfrontends dynamically
 */
export async function loadMfeModule(url: string): Promise<any> {
  console.log(`[loadMfeModule] Loading module from: ${url}`);
  return new Promise((resolve, reject) => {
    // Check if already loaded
    const scriptId = `mfe-script-${url.replace(/[^a-zA-Z0-9]/g, '-')}`;
    const existingScript = document.getElementById(scriptId);
    
    if (existingScript) {
      // Module already loaded, try to get it from window
      const moduleName = url.split('/').pop()?.replace('.tsx', '').replace('.ts', '') || 'mfe';
      let module = (window as any)[moduleName] || (window as any).__MFE_MODULES__?.[url];
      
      // Also check for workspaceMfe, adminMfe, authMfe patterns (support both old and new URLs)
      if (!module) {
        if (url.includes('3002') || url.includes('workspace') || url.includes('/mfe/workspace')) {
          module = (window as any).workspaceMfe;
        } else if (url.includes('3004') || url.includes('admin') || url.includes('/mfe/admin')) {
          module = (window as any).adminMfe;
        } else if (url.includes('3001') || url.includes('auth') || url.includes('/mfe/auth')) {
          module = (window as any).authMfe;
        } else if (url.includes('3003') || url.includes('analytics') || url.includes('/mfe/analytics')) {
          module = (window as any).analyticsMfe;
        }
      }
      
      if (module) {
        console.log(`[loadMfeModule] Module already loaded, found on window:`, module);
        resolve(module);
        return;
      } else {
        console.warn(`[loadMfeModule] Script exists but module not found on window. Available keys:`, Object.keys(window).filter(k => k.includes('Mfe') || k.includes('MFE')));
      }
    }

    // Create script tag to load the module
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'module';
    script.src = url;
    script.async = true;
    script.crossOrigin = 'anonymous';

    script.onload = () => {
      console.log(`[loadMfeModule] Script loaded: ${url}`);
      // Wait a bit for module to execute
      setTimeout(() => {
        // Try to find the module - check multiple patterns
        const moduleName = url.split('/').pop()?.replace('.tsx', '').replace('.ts', '') || 'mfe';
        let module = (window as any)[moduleName];
        
        // Check if it's in a global registry
        if (!module && (window as any).__MFE_MODULES__) {
          module = (window as any).__MFE_MODULES__[url];
        }
        
        // Check for specific MFE patterns (support both old port-based and new path-based URLs)
        if (!module) {
          if (url.includes('3002') || url.includes('workspace') || url.includes('/mfe/workspace')) {
            module = (window as any).workspaceMfe;
          } else if (url.includes('3004') || url.includes('admin') || url.includes('/mfe/admin')) {
            module = (window as any).adminMfe;
          } else if (url.includes('3001') || url.includes('auth') || url.includes('/mfe/auth')) {
            module = (window as any).authMfe;
          } else if (url.includes('3003') || url.includes('analytics') || url.includes('/mfe/analytics')) {
            module = (window as any).analyticsMfe;
          }
        }
        
        if (module && module.bootstrap && module.mount && module.unmount) {
          console.log(`[loadMfeModule] ✅ Module found on window:`, module);
          resolve(module);
        } else {
          console.error(`[loadMfeModule] ❌ Module not found. Available window keys:`, 
            Object.keys(window).filter(k => 
              k.toLowerCase().includes('mfe') || 
              k.toLowerCase().includes('workspace') ||
              k.toLowerCase().includes('admin') ||
              k.toLowerCase().includes('auth')
            )
          );
          reject(new Error(`Failed to load module from ${url}. Module not found on window. Expected bootstrap, mount, unmount functions.`));
        }
      }, 2000); // Increased wait time
    };

    script.onerror = () => {
      reject(new Error(`Failed to load script: ${url}`));
    };

    document.head.appendChild(script);
  });
}

