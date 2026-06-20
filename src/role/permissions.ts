import { UserRole } from './roles';

export interface RoutePermission {
  path: string;
  allowedRoles: UserRole[];
}

export const ROUTE_PERMISSIONS: RoutePermission[] = [
  {
    path: '/',
    allowedRoles: ['user'], // User main page
  },
  {
    path: '/home',
    allowedRoles: ['user'], // User main page
  },
  {
    path: '/login',
    allowedRoles: ['guest', 'admin', 'user'],
  },
  {
    path: '/products',
    allowedRoles: ['user'], // User catalog
  },
  {
    path: '/cart',
    allowedRoles: ['user'], // User cart
  },
  {
    path: '/orders',
    allowedRoles: ['user'], // User order history
  },
  {
    path: '/orders/:id',
    allowedRoles: ['user'], // User order details
  },
  {
    path: '/admin/dashboard',
    allowedRoles: ['admin'], // Admin analytics
  },
  {
    path: '/admin/products',
    allowedRoles: ['admin'], // Admin product manager
  },
  {
    path: '/promotions',
    allowedRoles: ['user'], // User promotions
  },
  {
    path: '/profile',
    allowedRoles: ['user', 'admin'], // User and admin profile
  },
  {
    path: '/admin/promotions',
    allowedRoles: ['admin'], // Admin promotions
  },
];

/**
 * Checks if a specific role is allowed to access a path
 */
export const isRouteAllowed = (path: string, role: UserRole): boolean => {
  // If exact route check matches
  const routePerm = ROUTE_PERMISSIONS.find(route => route.path === path);
  if (routePerm) {
    return routePerm.allowedRoles.includes(role);
  }

  // Handle nested admin routes
  if (path.startsWith('/admin') && role !== 'admin') {
    return false;
  }

  return true; // Default allow, or we can change default policy
};
