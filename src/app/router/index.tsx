import { createBrowserRouter } from 'react-router-dom';
import { publicRoutes } from '../../routes/public.routes';
import { userRoutes } from '../../routes/user.routes';
import { adminRoutes } from '../../routes/admin.routes';

export const router = createBrowserRouter([
  ...userRoutes,
  ...adminRoutes,
  ...publicRoutes, // public routes include the wildcard catch-all, so they must be at the end or react-router will order them correctly
]);
