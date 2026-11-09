import { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import { RoleGuard } from '../role/guards/RoleGuard';
import { MainLayout } from '../shared/components/layout/MainLayout';
import { HomePage } from '../modules/products/pages/HomePage';
import { CatalogPage } from '../modules/products/pages/CatalogPage';
import { ProductDetailPage } from '../modules/products/pages/ProductDetailPage';
import { LoadingFallback } from '../shared/components/ui/LoadingFallback';

const CartPage = lazy(() =>
  import('../modules/cart/pages/CartPage').then((m) => ({ default: m.CartPage }))
);
const PromotionsPage = lazy(() =>
  import('../modules/promotions/pages/PromotionsPage').then((m) => ({ default: m.PromotionsPage }))
);
const OrdersPage = lazy(() =>
  import('../modules/cart/pages/OrdersPage').then((m) => ({ default: m.OrdersPage }))
);
const OrderDetailPage = lazy(() =>
  import('../modules/cart/pages/OrderDetailPage').then((m) => ({ default: m.OrderDetailPage }))
);
const ProfilePage = lazy(() =>
  import('../modules/auth/pages/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);
const WishlistPage = lazy(() =>
  import('../modules/products/pages/WishlistPage').then((m) => ({ default: m.WishlistPage }))
);

export const userRoutes: RouteObject[] = [
  {
    path: '/',
    element: (
      <MainLayout>
        <CatalogPage />
      </MainLayout>
    ),
  },
  {
    path: '/home',
    element: (
      <MainLayout>
        <HomePage />
      </MainLayout>
    ),
  },
  {
    path: '/products',
    element: (
      <MainLayout>
        <CatalogPage />
      </MainLayout>
    ),
  },
  {
    path: '/products/:id',
    element: (
      <MainLayout>
        <ProductDetailPage />
      </MainLayout>
    ),
  },
  {
    path: '/promotions',
    element: (
      <MainLayout>
        <Suspense fallback={<LoadingFallback />}>
          <PromotionsPage />
        </Suspense>
      </MainLayout>
    ),
  },
  {
    path: '/wishlist',
    element: (
      <MainLayout>
        <Suspense fallback={<LoadingFallback />}>
          <WishlistPage />
        </Suspense>
      </MainLayout>
    ),
  },
  {
    path: '/cart',
    element: (
      <RoleGuard allowedRoles={['user']}>
        <MainLayout>
          <Suspense fallback={<LoadingFallback />}>
            <CartPage />
          </Suspense>
        </MainLayout>
      </RoleGuard>
    ),
  },
  {
    path: '/orders',
    element: (
      <RoleGuard allowedRoles={['user']}>
        <MainLayout>
          <Suspense fallback={<LoadingFallback />}>
            <OrdersPage />
          </Suspense>
        </MainLayout>
      </RoleGuard>
    ),
  },
  {
    path: '/orders/:id',
    element: (
      <RoleGuard allowedRoles={['user']}>
        <MainLayout>
          <Suspense fallback={<LoadingFallback />}>
            <OrderDetailPage />
          </Suspense>
        </MainLayout>
      </RoleGuard>
    ),
  },
  {
    path: '/profile',
    element: (
      <RoleGuard allowedRoles={['user', 'admin']}>
        <MainLayout>
          <Suspense fallback={<LoadingFallback />}>
            <ProfilePage />
          </Suspense>
        </MainLayout>
      </RoleGuard>
    ),
  },
];
