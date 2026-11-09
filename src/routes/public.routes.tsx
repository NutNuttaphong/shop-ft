import { RouteObject } from 'react-router-dom';
import { LoginPage } from '../modules/auth/pages/LoginPage';
import { NotFoundPage } from '../shared/pages/NotFoundPage';

export const publicRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];
