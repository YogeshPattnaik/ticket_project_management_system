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
      // Intercept React and ReactDOM imports
      if (id === 'react' || id === 'react-dom') {
        return `\0virtual:${id}`;
      }
      return null;
    },
    load(id) {
      // Replace React imports with window references
      if (id === '\0virtual:react') {
        return `
          let React;
          if (typeof window !== 'undefined' && window.__REACT__) {
            React = window.__REACT__;
          } else {
            // Fallback to local React if host React not available
            React = await import('react');
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
        `;
      }
      if (id === '\0virtual:react-dom') {
        return `
          let ReactDOM;
          if (typeof window !== 'undefined' && window.__REACT_DOM__) {
            ReactDOM = window.__REACT_DOM__;
          } else {
            // Fallback to local ReactDOM if host ReactDOM not available
            ReactDOM = await import('react-dom');
          }
          export default ReactDOM;
          export const render = ReactDOM.render;
          export const hydrate = ReactDOM.hydrate;
          export const createRoot = ReactDOM.createRoot;
          export const hydrateRoot = ReactDOM.hydrateRoot;
          export const unmountComponentAtNode = ReactDOM.unmountComponentAtNode;
          export const findDOMNode = ReactDOM.findDOMNode;
          export const version = ReactDOM.version;
        `;
      }
      return null;
    },
  };
}

