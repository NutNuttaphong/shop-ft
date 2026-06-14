import { RouteObject } from 'react-router-dom';
import { RoleGuard } from '../role/guards/RoleGuard';
import { MainLayout } from '../shared/components/layout/MainLayout';
import { DashboardPage } from '../modules/dashboard/pages/DashboardPage';
import { ManageProductsPage } from '../modules/products/pages/ManageProductsPage';
import { ManagePromotionsPage } from '../modules/promotions/pages/ManagePromotionsPage';
import { AnalyticsPage } from '../modules/dashboard/pages/AnalyticsPage';
import { SocialCommercePage } from '../modules/dashboard/pages/SocialCommercePage';
import { ManageNewsPage } from '../modules/promotions/pages/ManageNewsPage';

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
    path: '/admin/analytics',
    element: (
      <RoleGuard allowedRoles={['admin']}>
        <MainLayout>
          <AnalyticsPage />
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
  {
    path: '/admin/news',
    element: (
      <RoleGuard allowedRoles={['admin']}>
        <MainLayout>
          <ManageNewsPage />
        </MainLayout>
      </RoleGuard>
    ),
  },
  {
    path: '/admin/social',
    element: (
      <RoleGuard allowedRoles={['admin']}>
        <MainLayout>
          <SocialCommercePage />
        </MainLayout>
      </RoleGuard>
    ),
  },
];
