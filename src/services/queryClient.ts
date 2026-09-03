import { QueryClient } from '@tanstack/react-query';

/** Shared TanStack Query client for the React app. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 0,
    },
  },
});
