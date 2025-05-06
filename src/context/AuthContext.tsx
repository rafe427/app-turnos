'use client';
import React, { createContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  username: string;
  promocionId: number;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => false,
  logout: () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, password: string) => {
    // 1) admin / admin
    if (username === 'admin' && password === 'admin') {
      setUser({ username: 'admin', promocionId: -1, isAdmin: true });
      return true;
    }
    // 2) buscar alumno en localStorage (array de StudentContext)
    try {
      const students = JSON.parse(localStorage.getItem('students') || '[]');
      const found = students.find((s: any) => {
        // asumimos que s.nombre y s.apellido están guardados en s.nombre y s.apellido
        const u = (s.nombre.charAt(0) + s.apellido).toLowerCase();
        return u === username.toLowerCase() && String(s.dni) === password;
      });
      if (found) {
        setUser({
          username: `${found.nombre} ${found.apellido}`,
          promocionId: found.promocionId,
          isAdmin: false
        });
        return true;
      }
    } catch {
      // nada
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
