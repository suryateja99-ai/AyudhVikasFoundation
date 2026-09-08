import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import { LiveDataProvider } from './context/LiveDataContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <LiveDataProvider>
        <App />
      </LiveDataProvider>
    </AuthProvider>
  </StrictMode>,
);
