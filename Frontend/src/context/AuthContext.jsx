import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('authUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      if (token) {
        try {
          const data = await authApi.getMe();
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('authUser', JSON.stringify(data.user));
            localStorage.setItem('isAuthenticated', 'true');
          }
        } catch (err) {
          console.warn('[AuthContext] Session restore failed, clearing token.');
          logout();
        }
      }
      setLoading(false);
    }
    restoreSession();
  }, [token]);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    if (data.success && data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));
      localStorage.setItem('isAuthenticated', 'true');
    }
    return data;
  };

  const register = async (formData) => {
    const data = await authApi.register(formData);
    if (data.success && data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));
      localStorage.setItem('isAuthenticated', 'true');
    }
    return data;
  };

  const logout = async () => {
    try {
      await authApi.logout().catch(() => {});
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      localStorage.removeItem('isAuthenticated');
    }
  };

  const hasRole = (allowedRoles) => {
    if (!user) return false;
    if (typeof allowedRoles === 'string') {
      return user.role?.toLowerCase() === allowedRoles.toLowerCase();
    }
    if (Array.isArray(allowedRoles)) {
      return allowedRoles.map(r => r.toLowerCase()).includes(user.role?.toLowerCase());
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        role: user?.role?.toLowerCase() || 'patient',
        loading,
        login,
        register,
        logout,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
