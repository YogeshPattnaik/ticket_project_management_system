// Type declarations for Module Federation remotes
// These are virtual modules created at runtime by @module-federation/vite

declare module 'auth_mfe/App' {
  const Component: React.ComponentType<any>;
  export default Component;
}

declare module 'auth_mfe/Login' {
  const Component: React.ComponentType<any>;
  export default Component;
}

declare module 'auth_mfe/Register' {
  const Component: React.ComponentType<any>;
  export default Component;
}

declare module 'workspace_mfe/App' {
  const Component: React.ComponentType<any>;
  export default Component;
}

declare module 'analytics_mfe/App' {
  const Component: React.ComponentType<any>;
  export default Component;
}

declare module 'admin_mfe/App' {
  const Component: React.ComponentType<any>;
  export default Component;
}

