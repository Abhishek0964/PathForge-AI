import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, userService, type User } from '../services';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await userService.getProfile();
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const { data } = await authService.login({ email, password });
    localStorage.setItem('accessToken', data.accessToken);
    setUser(data.user);
    toast.success(`Welcome back, ${data.user.name}!`);
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await authService.register({ name, email, password });
    localStorage.setItem('accessToken', data.accessToken);
    setUser(data.user);
    toast.success('Account created successfully!');
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Continue with local logout even if API fails
    }
    localStorage.removeItem('accessToken');
    setUser(null);
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  const updateUser = (updatedUser: User) => setUser(updatedUser);

  return (
    <AuthContext.Provider value={{
      user, isLoading, isAuthenticated: !!user,
      login, register, logout, updateUser, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
