import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { SemesterProvider } from './lib/semester';
import './styles.css';

try {
  const saved = localStorage.getItem('sjp_theme');
  const theme = saved === 'dark' || saved === 'light'
    ? saved
    : 'dark';
  document.documentElement.dataset.theme = theme;
} catch {
  /* ignore */
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SemesterProvider>
      <App />
    </SemesterProvider>
  </React.StrictMode>,
);
