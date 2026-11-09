import { createContext } from 'react';
import { UserSession } from '../../../role/roles';

export interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; role?: 'admin' | 'user'; error?: string }>;
  register: (username: string, password: string, displayName: string, phone?: string, address?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (displayName: string, phone?: string, address?: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
