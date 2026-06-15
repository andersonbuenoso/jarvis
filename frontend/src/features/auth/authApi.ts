import { api } from "../../services/api";

export type AuthUser = {
  id: number;
  username: string;
  role: "ADMIN";
};

export type LoginResponse = {
  access_token: string;
  token_type: "bearer";
  user: AuthUser;
};

export async function login(username: string, password: string) {
  const { data } = await api.post<LoginResponse>("/api/auth/login", { username, password });
  return data;
}

export async function getMe() {
  const { data } = await api.get<AuthUser>("/api/auth/me");
  return data;
}
