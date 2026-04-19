import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppRouter } from '@/app/router';
import { ThemeHydrate } from '@/components/theme/ThemeHydrate';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000, networkMode: 'offlineFirst' },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeHydrate />
      <AppRouter />
    </QueryClientProvider>
  </StrictMode>,
);
