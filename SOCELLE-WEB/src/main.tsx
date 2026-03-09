// Global error handlers
window.onerror = (message, source, lineno, colno, error) => {
  console.error('[GlobalError]', { message, source, lineno, colno, error });
  return false;
};

window.onunhandledrejection = (event) => {
  console.error('[UnhandledRejection]', event.reason);
};

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { ConfigCheck } from './components/ConfigCheck.tsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 min — avoid refetch storms
      gcTime: 10 * 60 * 1000,         // 10 min garbage collection
      retry: 1,                        // single retry on failure
      refetchOnWindowFocus: false,     // explicit refetch only
    },
  },
});

const rootElement = document.getElementById('root');
const loadingSplash = document.getElementById('loading-splash');

if (!rootElement) {
  console.error('[FATAL] Root element not found');
} else {
  try {
    const root = createRoot(rootElement);

    root.render(
      <StrictMode>
        <HelmetProvider>
          <QueryClientProvider client={queryClient}>
            <ErrorBoundary>
              <ConfigCheck>
                <App />
              </ConfigCheck>
            </ErrorBoundary>
          </QueryClientProvider>
        </HelmetProvider>
      </StrictMode>
    );

    // Hide loading splash once app has mounted; fallback after 4s so it never sticks
    const hideSplash = () => {
      if (loadingSplash) loadingSplash.style.display = 'none';
    };
    setTimeout(hideSplash, 300);
    setTimeout(hideSplash, 4000);

  } catch (error) {
    console.error('[FATAL] Failed to render app:', error instanceof Error ? error.message : error);

    if (loadingSplash) {
      loadingSplash.style.display = 'none';
    }

    // Build the error UI using DOM APIs to avoid XSS via innerHTML with error content
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'min-height:100vh;background:#f1f5f9;display:flex;align-items:center;justify-content:center;padding:20px';

    const card = document.createElement('div');
    card.style.cssText = 'background:white;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);padding:32px;max-width:600px;width:100%';

    const title = document.createElement('h1');
    title.style.cssText = 'color:#dc2626;margin:0 0 16px 0';
    title.textContent = 'Startup Failed';

    const msg = document.createElement('p');
    msg.style.cssText = 'color:#1e293b;margin:0 0 16px 0';
    msg.textContent = 'React failed to initialize.';

    const errorBox = document.createElement('div');
    errorBox.style.cssText = 'background:#fef2f2;border:1px solid #fecaca;border-radius:4px;padding:16px;margin-bottom:16px';

    const pre = document.createElement('pre');
    pre.style.cssText = 'margin:0;font-size:11px;color:#991b1b;white-space:pre-wrap;word-break:break-word;max-height:300px;overflow:auto';
    pre.textContent = error instanceof Error
      ? `${error.message}\n\n${error.stack ?? ''}`
      : String(error);

    const btn = document.createElement('button');
    btn.style.cssText = 'background:#1e293b;color:white;border:none;padding:8px 16px;border-radius:4px;cursor:pointer';
    btn.textContent = 'Reload';
    btn.onclick = () => location.reload();

    errorBox.appendChild(pre);
    card.appendChild(title);
    card.appendChild(msg);
    card.appendChild(errorBox);
    card.appendChild(btn);
    wrapper.appendChild(card);
    rootElement.appendChild(wrapper);
  }
}
