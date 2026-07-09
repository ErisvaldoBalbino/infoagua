import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { TOKEN_KEY, onUnauthorized } from "../services/api/client";
import { storage } from "../services/storage";
import { authService, AuthUser, LoginPayload, RegisterPayload } from "../services/api/auth.service";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    onUnauthorized(clearSession);
  }, [clearSession]);

  useEffect(() => {
    async function restoreSession() {
      try {
        const savedToken = await storage.getItem(TOKEN_KEY);
        if (savedToken) {
          setToken(savedToken);
          try {
            const me = await authService.me();
            setUser(me);
          } catch (error: any) {
            console.error("Erro ao carregar dados do usuário na inicialização:", error);
            // Se for um erro 401 (Não Autorizado), limpa a sessão.
            // Para outros erros (ex: rede offline), mantemos o token para permitir que o usuário continue offline/tente novamente.
            if (error.response?.status === 401) {
              await storage.deleteItem(TOKEN_KEY);
              setToken(null);
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error("Erro ao recuperar o token do storage:", error);
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const { accessToken, user } = await authService.login(payload);
    await storage.setItem(TOKEN_KEY, accessToken);
    setToken(accessToken);
    setUser(user);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { accessToken, user } = await authService.register(payload);
    await storage.setItem(TOKEN_KEY, accessToken);
    setToken(accessToken);
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await storage.deleteItem(TOKEN_KEY);
    } finally {
      setToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  }
  return ctx;
}
