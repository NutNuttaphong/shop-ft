import { RouteObject } from 'react-router-dom';
import { RoleGuard } from '../role/guards/RoleGuard';
import { MainLayout } from '../shared/components/layout/MainLayout';
import { CatalogPage } from '../modules/products/pages/CatalogPage';
import { CartPage } from '../modules/cart/pages/CartPage';
import { PromotionsPage } from '../modules/promotions/pages/PromotionsPage';

export const userRoutes: RouteObject[] = [
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
