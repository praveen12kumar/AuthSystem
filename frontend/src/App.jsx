import './App.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'framer-motion';

import {AppContextProvider} from './context/AppContextProvider';
import { AppRoutes } from './utils/Routes';

function App() {
  const queryClient = new QueryClient();
  return (
    <>
      {/* reducedMotion="user" makes every framer-motion animation in the app
          respect the OS-level prefers-reduced-motion setting automatically -
          no need to handle it per-component. */}
      <MotionConfig reducedMotion="user">
        <QueryClientProvider client={queryClient}>
          <AppContextProvider>
            <AppRoutes />
          </AppContextProvider>
        </QueryClientProvider>
      </MotionConfig>
    </>
  );
}

export default App;
