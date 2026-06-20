import { RouteObject } from 'react-router-dom';
import { RoleGuard } from '../role/guards/RoleGuard';
import { MainLayout } from '../shared/components/layout/MainLayout';
import { HomePage } from '../modules/products/pages/HomePage';
import { CatalogPage } from '../modules/products/pages/CatalogPage';
import { ProductDetailPage } from '../modules/products/pages/ProductDetailPage';
import { CartPage } from '../modules/cart/pages/CartPage';
import { PromotionsPage } from '../modules/promotions/pages/PromotionsPage';
import { OrdersPage } from '../modules/cart/pages/OrdersPage';
import { OrderDetailPage } from '../modules/cart/pages/OrderDetailPage';
import { ProfilePage } from '../modules/auth/pages/ProfilePage';

export const userRoutes: RouteObject[] = [
  {
    path: '/',
    element: (
      <RoleGuard allowedRoles={['user']}>
        <MainLayout>
          <HomePage />
        </MainLayout>
      </RoleGuard>
    ),
  },
  {
    path: '/home',
    element: (
      <RoleGuard allowedRoles={['user']}>
        <MainLayout>
          <HomePage />
        </MainLayout>
      </RoleGuard>
    ),
  },
  {
    path: '/products',
    element: (
      <RoleGuard allowedRoles={['user']}>
        <MainLayout>
          <CatalogPage />
        </MainLayout>
      </RoleGuard>
    ),
  },
  {
    path: '/products/:id',
    element: (
      <RoleGuard allowedRoles={['user']}>
        <MainLayout>
          <ProductDetailPage />
        </MainLayout>
      </RoleGuard>
    ),
  },
  {
    path: '/cart',
    element: (
      <RoleGuard allowedRoles={['user']}>
        <MainLayout>
          <CartPage />
        </MainLayout>
      </RoleGuard>
    ),
  },
  {
    path: '/orders',
    element: (
      <RoleGuard allowedRoles={['user']}>
        <MainLayout>
          <OrdersPage />
        </MainLayout>
      </RoleGuard>
    ),
  },
  {
    path: '/orders/:id',
    element: (
      <RoleGuard allowedRoles={['user']}>
        <MainLayout>
          <OrderDetailPage />
        </MainLayout>
      </RoleGuard>
    ),
  },
  {
    path: '/profile',
    element: (
      <RoleGuard allowedRoles={['user', 'admin']}>
        <MainLayout>
          <ProfilePage />
        </MainLayout>
      </RoleGuard>
    ),
  },
  {
    path: '/promotions',
    element: (
      <RoleGuard allowedRoles={['user']}>
        <MainLayout>
          <PromotionsPage />
        </MainLayout>
      </RoleGuard>
    ),
  },
];
