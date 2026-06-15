import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../../services/api";
import { getMe, login as loginRequest, type AuthUser } from "./authApi";
import { AuthContext, type AuthContextValue } from "./authContextValue";
import { clearStoredToken, getStoredToken, storeToken } from "./authStorage";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    const interceptor = api.interceptors.request.use((config) => {
      const activeToken = getStoredToken();
      if (activeToken) {
        config.headers.Authorization = `Bearer ${activeToken}`;
      }
      return config;
    });
    return () => api.interceptors.request.eject(interceptor);
  }, []);

  useEffect(() => {
    async function hydrate() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setUser(await getMe());
      } catch {
        clearStoredToken();
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    hydrate();
  }, [token]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    loading,
    async login(username, password, remember) {
      const response = await loginRequest(username, password);
      storeToken(response.access_token, remember);
      setToken(response.access_token);
      setUser(response.user);
    },
    logout() {
      clearStoredToken();
      queryClient.clear();
      setToken(null);
      setUser(null);
    },
  }), [loading, queryClient, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
