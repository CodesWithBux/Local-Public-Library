import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App, { BookingsProvider } from './App.jsx';
import { LiveAnnouncerProvider } from './accessibility.jsx';
import './App.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LiveAnnouncerProvider>
        <BookingsProvider>
          <App />
        </BookingsProvider>
      </LiveAnnouncerProvider>
    </BrowserRouter>
  </StrictMode>
);
