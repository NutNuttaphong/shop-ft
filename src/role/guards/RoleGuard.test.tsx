import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RoleGuard } from './RoleGuard';
import * as authHook from '../../modules/auth/hooks/useAuth';

vi.mock('../../modules/auth/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('RoleGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner when auth status is loading', () => {
    vi.mocked(authHook.useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
    });

    render(
      <MemoryRouter>
        <RoleGuard allowedRoles={['user']}>
          <div>Protected Content</div>
        </RoleGuard>
      </MemoryRouter>
    );

    expect(screen.getByText('กำลังตรวจสอบสิทธิ์การใช้งาน...')).toBeInTheDocument();
  });

  it('redirects unauthenticated user to /login', () => {
    vi.mocked(authHook.useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <RoleGuard allowedRoles={['user']}>
                <div>Protected Content</div>
              </RoleGuard>
            }
          />
          <Route path="/login" element={<div>Login Page Mock</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page Mock')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).toBeNull();
  });

  it('renders children when user role is authorized', () => {
    vi.mocked(authHook.useAuth).mockReturnValue({
      user: {
        username: 'somchai',
        role: 'user',
        displayName: 'Somchai User',
        token: 'mock-token',
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <RoleGuard allowedRoles={['user']}>
          <div>Protected Content</div>
        </RoleGuard>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
