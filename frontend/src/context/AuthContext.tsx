import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  directLogin: (name: string, phone?: string, email?: string) => Promise<{ success: boolean; message?: string }>;
  register: (email: string, password: string, fullName: string, phone?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (fullName: string, phone?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('poster35_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('poster35_token');
  });

  useEffect(() => {
    if (token) {
      // Validate current user token
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('poster35_user', JSON.stringify(data.user));
          } else {
            logout();
          }
        })
        .catch(() => {
          // Keep current state on offline
        });
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('poster35_user', JSON.stringify(data.user));
        localStorage.setItem('poster35_token', data.token);
        return { success: true };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error during login' };
    }
  };

  const directLogin = async (name: string, phone?: string, email?: string) => {
    try {
      const res = await fetch('/api/auth/direct-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('poster35_user', JSON.stringify(data.user));
        localStorage.setItem('poster35_token', data.token);
        if (name?.trim()) {
          localStorage.setItem('poster35_customer_name', name.trim());
        }
        return { success: true };
      }
      return { success: false, message: data.message || 'Direct login failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error during direct login' };
    }
  };

  const register = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName, phone })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('poster35_user', JSON.stringify(data.user));
        localStorage.setItem('poster35_token', data.token);
        return { success: true };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error during registration' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('poster35_user');
    localStorage.removeItem('poster35_token');
  };

  const updateProfile = async (fullName: string, phone?: string) => {
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ full_name: fullName, phone })
      });
      const data = await res.json();
      if (data.success && user) {
        const updated = { ...user, full_name: fullName, phone };
        setUser(updated);
        localStorage.setItem('poster35_user', JSON.stringify(updated));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, login, directLogin, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
