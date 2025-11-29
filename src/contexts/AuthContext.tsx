import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'Administrator' | 'Sales Manager' | 'Editor' | 'Assistant' | 'Shipping Manager';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database
const MOCK_USERS: { email: string; password: string; name: string; role: UserRole }[] = [
  { email: 'admin@exemplo.com', password: 'senha1234', name: 'Admin Principal', role: 'Administrator' },
  { email: 'vendedor@exemplo.com', password: 'senha1234', name: 'João Vendas', role: 'Sales Manager' },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState(MOCK_USERS);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, remember: boolean): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (!foundUser) {
      return { success: false, error: 'E-mail ou senha incorretos. Por favor, tente novamente.' };
    }

    const userSession: User = {
      id: crypto.randomUUID(),
      email: foundUser.email,
      name: foundUser.name,
      role: foundUser.role,
    };

    setUser(userSession);
    
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('auth_user', JSON.stringify(userSession));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_user');
  };

  const register = async (email: string, password: string, name: string, role: UserRole): Promise<{ success: boolean; error?: string }> => {
    // Only admins can register new users
    if (user?.role !== 'Administrator') {
      return { success: false, error: 'Apenas administradores podem registrar novos usuários.' };
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Check if email already exists
    if (users.some(u => u.email === email)) {
      return { success: false, error: 'Este e-mail já está cadastrado.' };
    }

    // Add new user
    setUsers(prev => [...prev, { email, password, name, role }]);

    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
