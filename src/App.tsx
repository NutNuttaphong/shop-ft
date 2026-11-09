import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { AuthProvider } from './modules/auth/store/authContext';
import { ErrorBoundary } from './shared/components/ui/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
