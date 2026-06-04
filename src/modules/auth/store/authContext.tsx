import React, { createContext, useState, useEffect } from 'react';
import { UserSession } from '../../../role/roles';

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (displayName: string, phone?: string, address?: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load session on startup
    const storedSession = localStorage.getItem('app_auth_session');
    if (storedSession) {
      try {
        setUser(JSON.parse(storedSession));
      } catch (e) {
        localStorage.removeItem('app_auth_session');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (cleanUsername === 'user@1234' && cleanPassword === 'user@1234') {
      const session: UserSession = {
        username: cleanUsername,
        role: 'user',
        displayName: 'สมชาย รักดี (ลูกค้า)',
      };
      setUser(session);
      localStorage.setItem('app_auth_session', JSON.stringify(session));
      setIsLoading(false);
      return { success: true };
    }

    if (cleanUsername === 'admin@1234' && cleanPassword === 'admin@1234') {
      const session: UserSession = {
        username: cleanUsername,
        role: 'admin',
        displayName: 'สมศรี จัดการระบบ (ผู้ดูแล)',
      };
      setUser(session);
      localStorage.setItem('app_auth_session', JSON.stringify(session));
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return { success: false, error: 'ชื่อผู้ใช้งาน หรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('app_auth_session');
  };

  const updateProfile = (displayName: string, phone?: string, address?: string) => {
    if (!user) return;
    const updatedUser: UserSession = {
      ...user,
      displayName,
      phone,
      address
    };
    setUser(updatedUser);
    localStorage.setItem('app_auth_session', JSON.stringify(updatedUser));
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
