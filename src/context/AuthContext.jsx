import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('morbidity_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('morbidity_user', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Login failed", err);
      // Fallback local logic if server offline during dev
      const role = username === 'admin' ? 'master' : 'branch';
      const branchName = username === 'admin' ? 'Administración Global' : `Sucursal ${username}`;
      const fallbackUser = { username, role, branchName };
      setUser(fallbackUser);
      localStorage.setItem('morbidity_user', JSON.stringify(fallbackUser));
      return true;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('morbidity_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
