import { useContext } from 'react';
import { AuthContext } from '../store/authContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth ต้องใช้งานภายใต้ AuthProvider เสมอ');
  }
  return context;
};
