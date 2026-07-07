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
          const me = await authService.me();
          setUser(me);
        }
      } catch {
        await storage.deleteItem(TOKEN_KEY);
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
    await storage.deleteItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
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
