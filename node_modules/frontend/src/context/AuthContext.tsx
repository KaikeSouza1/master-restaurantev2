// master-restaurante-v2/packages/frontend/src/context/AuthContext.tsx

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { jwtDecode } from 'jwt-decode';
import { apiClient } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decodedUser = jwtDecode<User>(token);
        if (decodedUser.exp && decodedUser.exp * 1000 > Date.now()) {
          setUser(decodedUser);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        localStorage.removeItem('authToken');
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string) => {
    localStorage.setItem('authToken', token);
    const decodedUser = jwtDecode<User>(token);
    setUser(decodedUser);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    delete apiClient.defaults.headers.common['Authorization'];
    window.location.href = '/login';
  };

  if (loading) {
      return (
          <div className="h-screen bg-brand-gray-light flex items-center justify-center">
              <span className="text-xl font-semibold text-brand-blue-dark">Carregando Sessão...</span>
          </div>
      );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}