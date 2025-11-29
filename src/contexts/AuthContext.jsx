import { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, register as apiRegister, getMe } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore token from localStorage on mount
    const savedToken = localStorage.getItem('dream_token');
    if (savedToken) {
      setToken(savedToken);
      // Fetch user info
      getMe()
        .then((userData) => setUser(userData))
        .catch(() => {
          // Token invalid or expired, clear it
          localStorage.removeItem('dream_token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email, password) {
    const data = await apiLogin(email, password);
    const { access_token } = data;
    localStorage.setItem('dream_token', access_token);
    setToken(access_token);
    const userData = await getMe();
    setUser(userData);
  }

  async function register(email, password, nombre) {
    const data = await apiRegister(email, password, nombre);
    const { access_token } = data;
    localStorage.setItem('dream_token', access_token);
    setToken(access_token);
    const userData = await getMe();
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('dream_token');
    setToken(null);
    setUser(null);
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
