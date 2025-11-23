/**
 * Vite plugin to replace React imports with window.__REACT__
 * This ensures MFE components use the host's React instance
 */
import type { Plugin } from 'vite';

export function reactSharePlugin(): Plugin {
  return {
    name: 'react-share',
    enforce: 'pre',
    resolveId(id, importer) {
      // Don't intercept if the import is coming from our virtual module (avoid circular deps)
      // This allows the virtual module to import the actual React package
      if (importer && importer.startsWith('\0virtual:')) {
        return null; // Let Vite resolve normally to actual package
      }
      // Intercept React and ReactDOM imports from regular files
      if (id === 'react' || id === 'react-dom' || id === 'react-dom/client') {
        return `\0virtual:${id}`;
      }
      return null;
    },
    load(id) {
      // Replace React imports with window references
      if (id === '\0virtual:react') {
        return `
          // Import actual React package (this import won't be intercepted because importer is virtual)
          import * as LocalReact from 'react';
          const React = (typeof window !== 'undefined' && window.__REACT__) 
            ? window.__REACT__ 
            : LocalReact;
          if (typeof window !== 'undefined' && window.__REACT__) {
            console.log('[workspace-mfe] Using host React via plugin');
          } else {
            console.log('[workspace-mfe] Using local React (host not available)');
          }
          export default React;
          export const useState = React.useState;
          export const useEffect = React.useEffect;
          export const useMemo = React.useMemo;
          export const useCallback = React.useCallback;
          export const useContext = React.useContext;
          export const useReducer = React.useReducer;
          export const useRef = React.useRef;
          export const useImperativeHandle = React.useImperativeHandle;
          export const useLayoutEffect = React.useLayoutEffect;
          export const useDebugValue = React.useDebugValue;
          export const useId = React.useId;
          export const useTransition = React.useTransition;
          export const useDeferredValue = React.useDeferredValue;
          export const useSyncExternalStore = React.useSyncExternalStore;
          export const useInsertionEffect = React.useInsertionEffect;
          export const createElement = React.createElement;
          export const Fragment = React.Fragment;
          export const StrictMode = React.StrictMode;
          export const Suspense = React.Suspense;
          export const Component = React.Component;
          export const PureComponent = React.PureComponent;
          export const memo = React.memo;
          export const forwardRef = React.forwardRef;
          export const lazy = React.lazy;
          export const Children = React.Children;
          export const isValidElement = React.isValidElement;
          export const cloneElement = React.cloneElement;
          export const createContext = React.createContext;
          export const version = React.version;
          export const startTransition = React.startTransition;
          export const use = React.use;
        `;
      }
      if (id === '\0virtual:react-dom') {
        return `
          // Import actual ReactDOM package (this import won't be intercepted because importer is virtual)
          import * as LocalReactDOM from 'react-dom';
          const ReactDOM = (typeof window !== 'undefined' && window.__REACT_DOM__) 
            ? window.__REACT_DOM__ 
            : LocalReactDOM;
          if (typeof window !== 'undefined' && window.__REACT_DOM__) {
            console.log('[workspace-mfe] Using host ReactDOM via plugin');
          }
          export default ReactDOM;
        `;
      }
      if (id === '\0virtual:react-dom/client') {
        return `
          // Import actual ReactDOM client package (this import won't be intercepted because importer is virtual)
          import * as LocalReactDOMClient from 'react-dom/client';
          // window.__REACT_DOM__ should be from react-dom/client (exposed by shell app)
          const ReactDOMClient = (typeof window !== 'undefined' && window.__REACT_DOM__ && typeof window.__REACT_DOM__.createRoot === 'function') 
            ? window.__REACT_DOM__ 
            : LocalReactDOMClient;
          if (typeof window !== 'undefined' && window.__REACT_DOM__ && typeof window.__REACT_DOM__.createRoot === 'function') {
            console.log('[workspace-mfe] Using host ReactDOM via plugin');
          } else {
            console.log('[workspace-mfe] Using local ReactDOM (host not available or invalid)');
          }
          export default ReactDOMClient;
          export const createRoot = ReactDOMClient.createRoot;
          export const hydrateRoot = ReactDOMClient.hydrateRoot;
          export const flushSync = ReactDOMClient.flushSync;
        `;
      }
      return null;
    },
  };
}

