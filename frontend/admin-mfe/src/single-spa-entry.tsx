import * as LocalReact from 'react';
import * as LocalReactDOM from 'react-dom/client';
import singleSpaReact from 'single-spa-react';
import App from './App';
import './index.css';

// Wait a bit for host React to be exposed, then use it
let React: any;
let ReactDOM: any;

if (typeof window !== 'undefined') {
  if ((window as any).__REACT__ && (window as any).__REACT_DOM__) {
    React = (window as any).__REACT__;
    ReactDOM = (window as any).__REACT_DOM__;
    console.log('[admin-mfe] Using host React');
  } else {
    React = LocalReact;
    ReactDOM = LocalReactDOM;
    console.log('[admin-mfe] Using local React (host React not available yet)');
  }
} else {
  React = LocalReact;
  ReactDOM = LocalReactDOM;
}

// Ensure App is a valid component function
const RootComponent = typeof App === 'function' ? App : () => React.createElement('div', null, 'App component not found');

// Wrap App to ensure it uses the correct React instance
const WrappedApp = (props: any) => {
  return React.createElement(RootComponent, props);
};

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: WrappedApp,
  errorBoundary(err, info, props) {
    return React.createElement('div', { className: 'p-4 bg-red-50 border border-red-200 rounded' },
      React.createElement('h2', { className: 'text-red-800 font-bold' }, 'Error in Admin MFE'),
      React.createElement('p', { className: 'text-red-600' }, err.message)
    );
  },
  domElementGetter: () => {
    let el = document.getElementById('admin-mfe-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'admin-mfe-container';
      document.body.appendChild(el);
    }
    return el;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;

