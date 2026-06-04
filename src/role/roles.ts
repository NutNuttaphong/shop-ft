export type UserRole = 'admin' | 'user' | 'guest';

export interface UserSession {
  username: string;
  role: UserRole;
  displayName: string;
  token?: string;
  phone?: string;
  address?: string;
}

export const ROLES = {
  ADMIN: 'admin' as UserRole,
  USER: 'user' as UserRole,
  GUEST: 'guest' as UserRole,
};
