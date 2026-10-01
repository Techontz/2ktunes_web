import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from '@/App.tsx';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { LanguageProvider } from '@/lib/LanguageContext';
import '@/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      {/* Outermost app boundary: a render crash or a stale lazy chunk shows a
          friendly 500 page with a reload button instead of a blank screen. */}
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </LanguageProvider>
  </StrictMode>,
);
