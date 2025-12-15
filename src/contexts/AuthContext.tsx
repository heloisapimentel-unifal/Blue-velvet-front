import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

// Tipagem do usuário
export type UserRole =
  | 'Administrator'
  | 'Sales Manager'
  | 'Editor'
  | 'Assistant'
  | 'Shipping Manager'
  | 'ADMIN'
  | 'USER';

export interface User {
  id?: string;
  email: string; // No Java é 'login', mas aqui usaremos email para facilitar
  login?: string; // Mantemos login opcional para compatibilidade
  name: string;
  role: UserRole;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    remember?: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (
    email: string,
    password: string,
    name: string,
    role: string
  ) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ao iniciar, verifica se tem usuário salvo (localStorage ou sessionStorage)
  useEffect(() => {
    const storedUser =
      localStorage.getItem('user_data') ||
      sessionStorage.getItem('user_data');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  // --- LOGIN REAL CONECTANDO NO JAVA ---
  const login = async (
    email: string,
    password: string,
    remember: boolean = false
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: email,
          password: password,
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Login falhou. Verifique suas credenciais.',
        };
      }

      const data = await response.json();

      const userSession: User = {
        email: email,
        login: email,
        name: data.name,
        role: data.role,
        token: data.token,
      };

      setUser(userSession);

      const storage = remember ? localStorage : sessionStorage;

      storage.setItem('user_data', JSON.stringify(userSession));
      storage.setItem('auth_token', data.token);

      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro de conexão com o servidor.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_data');
    sessionStorage.removeItem('auth_token');
  };

  // --- REGISTER REAL ---
  const register = async (
    email: string,
    password: string,
    name: string,
    role: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // 1. RECUPERAR O TOKEN (Procura no Local e Session Storage)
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      // Se não tiver token, nem adianta tentar (O Back-end vai barrar)
      if (!token) {
        return { success: false, error: 'Você precisa estar logado para realizar cadastros.' };
      }

      const response = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            // 2. AQUI ESTÁ A MÁGICA: ENVIANDO O TOKEN
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          login: email,
          password: password,
          name: name,
          role: role === 'Administrator' ? 'ADMIN' : 'USER',
        }),
      });

      if (response.ok) {
        return { success: true };
      } else {
        // Se der 403 aqui, é porque o token existe mas não é de ADMIN
        if (response.status === 403) {
            return { success: false, error: 'Permissão negada: Apenas administradores podem cadastrar.' };
        }
        return { success: false, error: 'Erro ao registrar usuário.' };
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão.' };
    }
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
