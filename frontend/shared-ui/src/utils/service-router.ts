/**
 * Service Router - Dynamically routes API calls to the correct backend service
 * based on the API endpoint path
 */

// Service port configuration
// Backend services use 8000+ ports to avoid conflicts with MFE frontends (3001-3004)
const SERVICE_PORTS = {
  AUTH: 8001,           // Auth Service (3001 used by auth-mfe frontend)
  PROJECT: 8002,        // Project Service (3002 used by workspace-mfe frontend)
  NOTIFICATION: 8003,   // Notification Service (3003 used by analytics-mfe frontend)
  MIGRATION: 8004,      // Migration Service (3004 used by admin-mfe frontend)
} as const;

// Service base URLs (development)
const getServiceBaseUrl = (port: number): string => {
  // Check for environment variable override
  if (typeof process !== 'undefined' && process.env) {
    const envUrl = process.env[`NEXT_PUBLIC_SERVICE_PORT_${port}`];
    if (envUrl) return envUrl;
  }
  
  // Check for browser global
  if (typeof window !== 'undefined') {
    const windowUrl = (window as any)[`__SERVICE_PORT_${port}__`];
    if (windowUrl) return windowUrl;
  }
  
  // Default to localhost with port
  return `http://localhost:${port}`;
};

// Service routing map: path prefix -> service port
const SERVICE_ROUTES: Array<{ paths: string[]; port: number; name: string }> = [
  {
    name: 'auth-service',
    port: SERVICE_PORTS.AUTH,
    paths: ['/api/v1/auth', '/api/v1/users', '/api/v1/roles'],
  },
  {
    name: 'project-service',
    port: SERVICE_PORTS.PROJECT,
    paths: ['/api/v1/projects', '/api/v1/tasks', '/api/v1/boards', '/api/v1/workflows', '/api/v1/slas'],
  },
  {
    name: 'notification-service',
    port: SERVICE_PORTS.NOTIFICATION,
    paths: ['/api/v1/notifications'],
  },
  {
    name: 'migration-service',
    port: SERVICE_PORTS.MIGRATION,
    paths: ['/api/v1/migrations'],
  },
];

/**
 * Get the base URL for a service based on the API path
 * @param url - The full API URL or path (e.g., '/api/v1/auth/login' or 'http://localhost:8001/api/v1/auth/login')
 * @returns The base URL of the service (e.g., 'http://localhost:8001')
 */
export const getServiceUrl = (url: string): string => {
  // Extract path from full URL if needed
  let path = url;
  try {
    const urlObj = new URL(url);
    path = urlObj.pathname;
  } catch {
    // Not a full URL, assume it's a path
    path = url.startsWith('/') ? url : `/${url}`;
  }

  // Find matching service route
  for (const route of SERVICE_ROUTES) {
    for (const routePath of route.paths) {
      if (path.startsWith(routePath)) {
        return getServiceBaseUrl(route.port);
      }
    }
  }

  // Default fallback to auth service
  console.warn(`No service route found for path: ${path}, defaulting to auth service`);
  return getServiceBaseUrl(SERVICE_PORTS.AUTH);
};

/**
 * Get service information for a given path
 */
export const getServiceInfo = (url: string): { name: string; port: number; baseUrl: string } => {
  let path = url;
  try {
    const urlObj = new URL(url);
    path = urlObj.pathname;
  } catch {
    path = url.startsWith('/') ? url : `/${url}`;
  }

  for (const route of SERVICE_ROUTES) {
    for (const routePath of route.paths) {
      if (path.startsWith(routePath)) {
        return {
          name: route.name,
          port: route.port,
          baseUrl: getServiceBaseUrl(route.port),
        };
      }
    }
  }

  // Default to auth service
  return {
    name: 'auth-service',
    port: SERVICE_PORTS.AUTH,
    baseUrl: getServiceBaseUrl(SERVICE_PORTS.AUTH),
  };
};

/**
 * Check if API Gateway mode is enabled (single base URL for all services)
 */
export const isApiGatewayMode = (): boolean => {
  if (typeof process !== 'undefined' && process.env) {
    const gatewayUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
    if (gatewayUrl) return true;
  }
  
  if (typeof window !== 'undefined') {
    const gatewayUrl = (window as any).__API_GATEWAY_URL__;
    if (gatewayUrl) return true;
  }
  
  return false;
};

/**
 * Get API Gateway URL if enabled
 */
export const getApiGatewayUrl = (): string | null => {
  if (typeof process !== 'undefined' && process.env) {
    const gatewayUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
    if (gatewayUrl) return gatewayUrl;
  }
  
  if (typeof window !== 'undefined') {
    const gatewayUrl = (window as any).__API_GATEWAY_URL__;
    if (gatewayUrl) return gatewayUrl;
  }
  
  return null;
};

