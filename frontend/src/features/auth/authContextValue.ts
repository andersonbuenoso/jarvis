import { createContext } from "react";
import type { AuthUser } from "./authApi";

export type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
