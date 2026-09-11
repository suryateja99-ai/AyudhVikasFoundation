import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import { LiveDataProvider } from './context/LiveDataContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GlobalApiSpinner } from './components/GlobalApiSpinner';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LiveDataProvider>
          <ErrorBoundary>
            <GlobalApiSpinner />
            <App />
          </ErrorBoundary>
        </LiveDataProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
