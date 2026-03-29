'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          success: {
            style: {
              background: '#16a34a',
              color: '#fff',
              fontSize: '0.8125rem',
            },
            iconTheme: { primary: '#fff', secondary: '#16a34a' },
          },
        }}
      />
    </QueryClientProvider>
  );
}
