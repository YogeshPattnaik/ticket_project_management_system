import * as LocalReact from 'react';
import * as LocalReactDOM from 'react-dom/client';
import singleSpaReact from 'single-spa-react';
import App from './App';
import './index.css';

// Get React instance - prefer host React, fallback to local
// Wait a bit for host React to be available (shell app loads first)
let React: any;
let ReactDOM: any;

if (typeof window !== 'undefined') {
  // Check immediately
  if ((window as any).__REACT__ && (window as any).__REACT_DOM__) {
    React = (window as any).__REACT__;
    ReactDOM = (window as any).__REACT_DOM__;
    console.log('[workspace-mfe] Using host React (immediate)');
  } else {
    // Wait a bit for shell app to expose React
    // This is a fallback - the Vite plugin should handle most cases
    React = LocalReact;
    ReactDOM = LocalReactDOM;
    console.log('[workspace-mfe] Using local React (host React not available yet)');
    
    // Try to get host React after a short delay
    setTimeout(() => {
      if ((window as any).__REACT__ && (window as any).__REACT_DOM__) {
        console.log('[workspace-mfe] Host React now available, but already initialized with local React');
      }
    }, 100);
  }
} else {
  React = LocalReact;
  ReactDOM = LocalReactDOM;
}

// Ensure App is a valid component function
console.log('[workspace-mfe] App type:', typeof App);
console.log('[workspace-mfe] App value:', App);
console.log('[workspace-mfe] React type:', typeof React);
console.log('[workspace-mfe] ReactDOM type:', typeof ReactDOM);

const RootComponent = typeof App === 'function' ? App : () => {
  console.error('[workspace-mfe] App is not a function!', App);
  return React.createElement('div', null, 'App component not found');
};

if (typeof RootComponent !== 'function') {
  throw new Error('RootComponent must be a function');
}

// Wrap App to ensure it uses the correct React instance
const WrappedApp = (props: any) => {
  return React.createElement(RootComponent, props);
};

console.log('[workspace-mfe] WrappedApp type:', typeof WrappedApp);
console.log('[workspace-mfe] Creating single-spa-react lifecycles...');

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: WrappedApp,
  errorBoundary(err, info, props) {
    return React.createElement('div', { className: 'p-4 bg-red-50 border border-red-200 rounded' },
      React.createElement('h2', { className: 'text-red-800 font-bold' }, 'Error in Workspace MFE'),
      React.createElement('p', { className: 'text-red-600' }, err.message)
    );
  },
  domElementGetter: () => {
    let el = document.getElementById('workspace-mfe-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'workspace-mfe-container';
      document.body.appendChild(el);
    }
    return el;
  },
});

console.log('[workspace-mfe] Lifecycles created:', lifecycles);

export const { bootstrap, mount, unmount } = lifecycles;

