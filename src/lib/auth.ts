import { jwtDecode } from "jwt-decode";

export interface AuthUser {
  userId: string;
  roleName: string;
  permissions?: string[];
  iat?: number;
  exp?: number;
}

const TOKEN_KEY = "token";
const USER_KEY = "user";

export function decodeToken(token: string): AuthUser | null {
  try {
    return jwtDecode<AuthUser>(token);
  } catch {
    return null;
  }
}

export function saveAuth(token: string): AuthUser | null {
  const user = decodeToken(token);
  if (!user) return null;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isTokenExpired(token: string): boolean {
  const user = decodeToken(token);
  if (!user?.exp) return true;
  return user.exp * 1000 < Date.now();
}
