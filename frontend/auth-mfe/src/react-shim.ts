/**
 * React shim that uses host's React if available
 * This ensures MFE components use the same React instance as the host
 * 
 * This file is aliased as 'react' in vite.config.ts
 * At runtime, we check window.__REACT__ first, then fall back to local React
 */

// Import the actual react package using a path that won't be aliased
// We use a relative path to node_modules to bypass the alias
// @ts-ignore - This import path bypasses Vite's alias resolution
import * as LocalReactPackage from '../../node_modules/react/index.js';
// @ts-ignore
import * as LocalReactDOMPackage from '../../node_modules/react-dom/index.js';

// At runtime, prefer host React if available
const getReact = () => {
  if (typeof window !== 'undefined' && (window as any).__REACT__) {
    console.log('[auth-mfe ReactShim] Using host React');
    return (window as any).__REACT__;
  }
  console.log('[auth-mfe ReactShim] Using local React (host React not available)');
  return LocalReactPackage;
};

const getReactDOM = () => {
  if (typeof window !== 'undefined' && (window as any).__REACT_DOM__) {
    return (window as any).__REACT_DOM__;
  }
  return LocalReactDOMPackage;
};

// Get the React instance to use (checked at module load time)
// Note: This will use local React at build time, but at runtime
// we need to check window again. For proper runtime switching,
// we'll export a getter function, but for compatibility we'll
// also export the value directly.
const React = getReact();
const ReactDOM = getReactDOM();

// Re-export everything from React
// We can't use export * from because of the alias, so we export default
// and let the module system handle named exports via the alias
export default React;

// Export ReactDOM
export { ReactDOM };

// For named exports, we need to export them explicitly or use a proxy
// The simplest is to just export the React object and let destructuring work
// But TypeScript needs explicit exports. Let's use a namespace export approach.
// Actually, since we're aliasing this file as 'react', any import from 'react'
// will get this file, and we can re-export from the actual package.
// But that creates a circular dependency...

// Better approach: Export a proxy that forwards all properties
export const useState = React.useState;
export const useEffect = React.useEffect;
export const useCallback = React.useCallback;
export const useMemo = React.useMemo;
export const useRef = React.useRef;
export const useContext = React.useContext;
export const useReducer = React.useReducer;
export const useLayoutEffect = React.useLayoutEffect;
export const useInsertionEffect = React.useInsertionEffect;
export const useImperativeHandle = React.useImperativeHandle;
export const useDebugValue = React.useDebugValue;
export const useId = React.useId;
export const useTransition = React.useTransition;
export const useDeferredValue = React.useDeferredValue;
export const useSyncExternalStore = React.useSyncExternalStore;
export const Fragment = React.Fragment;
export const StrictMode = React.StrictMode;
export const Suspense = React.Suspense;
export const createElement = React.createElement;
export const cloneElement = React.cloneElement;
export const createContext = React.createContext;
export const forwardRef = React.forwardRef;
export const memo = React.memo;
export const lazy = React.lazy;
export const startTransition = React.startTransition;
export const version = React.version;
export const Children = React.Children;
export const Component = React.Component;
export const PureComponent = React.PureComponent;
export const createRef = React.createRef;
export const isValidElement = React.isValidElement;

// ReactDOM exports
export const createRoot = ReactDOM.createRoot;
export const hydrateRoot = ReactDOM.hydrateRoot;
export const flushSync = ReactDOM.flushSync;
