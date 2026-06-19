import { useState, useEffect } from 'react';

const TOKEN_KEY = 'esportsarena_token';

export interface AuthUser {
  userId: string;
  platformId: string;
  role: string;
  isActive: boolean;
}

function parseToken(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      userId: payload.sub,
      platformId: payload.platformId,
      role: payload.role,
      isActive: payload.isActive === 'true' || payload.isActive === true,
    };
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event('auth-changed'));
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event('auth-changed'));
}

export function getToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token || isTokenExpired(token)) {
    if (token) clearToken();
    return null;
  }
  return token;
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => getToken());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function handleAuthChange() {
      setToken(getToken());
    }
    window.addEventListener('auth-changed', handleAuthChange);
    return () => window.removeEventListener('auth-changed', handleAuthChange);
  }, []);

  const user = token ? parseToken(token) : null;

  return {
    token,
    session: token ? { access_token: token } : null,
    user,
    loading,
  };
}
