import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App, { BookingsProvider } from './App.jsx';
import { LiveAnnouncerProvider } from './accessibility.jsx';
import './App.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <LiveAnnouncerProvider>
        <BookingsProvider>
          <App />
        </BookingsProvider>
      </LiveAnnouncerProvider>
    </HashRouter>
  </StrictMode>
);
