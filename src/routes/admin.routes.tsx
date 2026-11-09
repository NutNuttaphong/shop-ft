import { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import { RoleGuard } from '../role/guards/RoleGuard';
import { MainLayout } from '../shared/components/layout/MainLayout';
import { LoadingFallback } from '../shared/components/ui/LoadingFallback';

const DashboardPage = lazy(() =>
  import('../modules/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const AnalyticsPage = lazy(() =>
  import('../modules/dashboard/pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage }))
);
const ManageProductsPage = lazy(() =>
  import('../modules/products/pages/ManageProductsPage').then((m) => ({ default: m.ManageProductsPage }))
);
const ManagePromotionsPage = lazy(() =>
  import('../modules/promotions/pages/ManagePromotionsPage').then((m) => ({ default: m.ManagePromotionsPage }))
);
const ManageNewsPage = lazy(() =>
  import('../modules/promotions/pages/ManageNewsPage').then((m) => ({ default: m.ManageNewsPage }))
);
const SocialCommercePage = lazy(() =>
  import('../modules/dashboard/pages/SocialCommercePage').then((m) => ({ default: m.SocialCommercePage }))
);

export const adminRoutes: RouteObject[] = [
  {
    path: '/admin/dashboard',
    element: (
      <RoleGuard allowedRoles={['admin']}>
        <MainLayout>
          <Suspense fallback={<LoadingFallback />}>
            <DashboardPage />
          </Suspense>
        </MainLayout>
      </RoleGuard>
    ),
  },
  {
    path: '/admin/analytics',
    element: (
      <RoleGuard allowedRoles={['admin']}>
        <MainLayout>
          <Suspense fallback={<LoadingFallback />}>
            <AnalyticsPage />
          </Suspense>
        </MainLayout>
      </RoleGuard>
    ),
  },
  {
    path: '/admin/products',
    element: (
      <RoleGuard allowedRoles={['admin']}>
        <MainLayout>
          <Suspense fallback={<LoadingFallback />}>
            <ManageProductsPage />
          </Suspense>
        </MainLayout>
      </RoleGuard>
    ),
  },
  {
    path: '/admin/promotions',
    element: (
      <RoleGuard allowedRoles={['admin']}>
        <MainLayout>
          <Suspense fallback={<LoadingFallback />}>
            <ManagePromotionsPage />
          </Suspense>
        </MainLayout>
      </RoleGuard>
    ),
  },
  {
    path: '/admin/news',
    element: (
      <RoleGuard allowedRoles={['admin']}>
        <MainLayout>
          <Suspense fallback={<LoadingFallback />}>
            <ManageNewsPage />
          </Suspense>
        </MainLayout>
      </RoleGuard>
    ),
  },
  {
    path: '/admin/social',
    element: (
      <RoleGuard allowedRoles={['admin']}>
        <MainLayout>
          <Suspense fallback={<LoadingFallback />}>
            <SocialCommercePage />
          </Suspense>
        </MainLayout>
      </RoleGuard>
    ),
  },
];
