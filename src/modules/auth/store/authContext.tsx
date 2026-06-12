import React, { createContext, useState, useEffect } from 'react';
import { UserSession } from '../../../role/roles';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; role?: 'admin' | 'user'; error?: string }>;
  register: (username: string, password: string, displayName: string, phone?: string, address?: string) => Promise<{ success: boolean; error?: string }>;
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

  const login = async (username: string, password: string): Promise<{ success: boolean; role?: 'admin' | 'user'; error?: string }> => {
    setIsLoading(true);

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, password: cleanPassword }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        setIsLoading(false);
        return { success: false, error: json.message || 'ชื่อผู้ใช้งาน หรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง' };
      }

      const data = json.data;
      const session: UserSession = {
        username: data.username,
        role: data.role.toLowerCase() as 'admin' | 'user',
        displayName: data.displayName || data.username,
        token: data.token,
        phone: data.phone,
        address: data.address,
      };

      setUser(session);
      localStorage.setItem('app_auth_session', JSON.stringify(session));
      setIsLoading(false);
      return { success: true, role: session.role as 'admin' | 'user' };
    } catch (err: any) {
      setIsLoading(false);
      return {
        success: false,
        error: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่า Backend กำลังทำงานอยู่',
      };
    }
  };

  const register = async (
    username: string, 
    password: string, 
    displayName: string, 
    phone?: string, 
    address?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();
    const cleanDisplayName = displayName.trim();

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: cleanUsername, 
          password: cleanPassword, 
          displayName: cleanDisplayName,
          phone: phone ? phone.trim() : undefined,
          address: address ? address.trim() : undefined
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        setIsLoading(false);
        return { success: false, error: json.message || 'การสมัครสมาชิกล้มเหลว กรุณาตรวจสอบข้อมูลอีกครั้ง' };
      }

      const data = json.data;
      const session: UserSession = {
        username: data.username,
        role: data.role.toLowerCase() as 'admin' | 'user',
        displayName: data.displayName || data.username,
        token: data.token,
        phone: data.phone,
        address: data.address,
      };

      setUser(session);
      localStorage.setItem('app_auth_session', JSON.stringify(session));
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return {
        success: false,
        error: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่า Backend กำลังทำงานอยู่',
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('app_auth_session');
  };

  const updateProfile = async (displayName: string, phone?: string, address?: string) => {
    if (!user) return;

    try {
      const token = user.token;
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ displayName, phone, address }),
      });

      const json = await response.json();

      if (response.ok && json.success) {
        const updatedUser: UserSession = {
          ...user,
          displayName: json.data.displayName || displayName,
          phone: json.data.phone || phone,
          address: json.data.address || address,
        };
        setUser(updatedUser);
        localStorage.setItem('app_auth_session', JSON.stringify(updatedUser));
      } else {
        // Fallback: update locally even if server fails
        const updatedUser: UserSession = { ...user, displayName, phone, address };
        setUser(updatedUser);
        localStorage.setItem('app_auth_session', JSON.stringify(updatedUser));
      }
    } catch {
      // Fallback: update locally
      const updatedUser: UserSession = { ...user, displayName, phone, address };
      setUser(updatedUser);
      localStorage.setItem('app_auth_session', JSON.stringify(updatedUser));
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
