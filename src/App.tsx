import React from 'react';
import { AppRoutes } from './routes/routes';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { PushSync } from './components/PushSync';

export default function App() {
  return (
    <>
      <AppRoutes />
      <CookieConsentBanner />
      <PushSync />
    </>
  );
}
