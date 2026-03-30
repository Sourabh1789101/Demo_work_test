import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authService, User, AuthCredentials, SignupCredentials } from '../services/authService';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  register: (credentials: SignupCredentials) => Promise<void>;
  login: (credentials: AuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize on mount
  useEffect(() => {
    const storedUser = authService.getStoredUser();
    if (storedUser && authService.isAuthenticated()) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const register = async (credentials: SignupCredentials) => {
    setError(null);
    setLoading(true);
    try {
      const response = await authService.register(credentials);
      setUser(response.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: AuthCredentials) => {
    setError(null);
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
