import { RouteObject } from 'react-router-dom';
import { RoleGuard } from '../role/guards/RoleGuard';
import { MainLayout } from '../shared/components/layout/MainLayout';
import { DashboardPage } from '../modules/dashboard/pages/DashboardPage';
import { ManageProductsPage } from '../modules/products/pages/ManageProductsPage';
import { ManagePromotionsPage } from '../modules/promotions/pages/ManagePromotionsPage';

export const adminRoutes: RouteObject[] = [
  {
    path: '/admin/dashboard',
    element: (
      <RoleGuard allowedRoles={['admin']}>
        <MainLayout>
          <DashboardPage />
        </MainLayout>
      </RoleGuard>
    ),
  },
  {
    path: '/admin/products',
    element: (
      <RoleGuard allowedRoles={['admin']}>
        <MainLayout>
          <ManageProductsPage />
        </MainLayout>
      </RoleGuard>
    ),
  },
  {
    path: '/admin/promotions',
    element: (
      <RoleGuard allowedRoles={['admin']}>
        <MainLayout>
          <ManagePromotionsPage />
        </MainLayout>
      </RoleGuard>
    ),
  },
];
