import { RouteObject, Navigate } from 'react-router-dom';
import { LoginPage } from '../modules/auth/pages/LoginPage';

export const publicRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
];
