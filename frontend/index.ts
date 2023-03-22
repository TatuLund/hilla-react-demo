import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';
import { ThemeProvider, ThemeProviderPropTypes } from '@ui5/webcomponents-react';

const root = createRoot(document.getElementById('outlet')!) //.render(createElement(App));

root.render(createElement(ThemeProvider, null, createElement(App)));