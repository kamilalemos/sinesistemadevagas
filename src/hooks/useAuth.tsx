import { useState, useEffect } from "react";

const CREDENTIALS_KEY = "sine_admin_credentials";
const SESSION_KEY = "sine_admin_session";

type StoredCredentials = { email: string; password: string };

const readCredentials = (): StoredCredentials | null => {
  const raw = localStorage.getItem(CREDENTIALS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasAdmin, setHasAdmin] = useState(false);

  useEffect(() => {
    setHasAdmin(!!readCredentials());
    const savedUser = localStorage.getItem(SESSION_KEY);
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setIsAdmin(true);
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (emailInput: string, passwordInput: string) => {
    if (readCredentials()) {
      return { error: { message: "Já existe um administrador cadastrado." } };
    }
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();
    if (!email || !password) {
      return { error: { message: "Preencha e-mail e senha." } };
    }
    if (password.length < 6) {
      return { error: { message: "A senha deve ter pelo menos 6 caracteres." } };
    }
    const creds: StoredCredentials = { email, password };
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email }));
    setUser({ email });
    setIsAdmin(true);
    setHasAdmin(true);
    return { error: null };
  };

  const signIn = async (emailInput: string, passwordInput: string) => {
    const creds = readCredentials();
    if (!creds) {
      return { error: { message: "Nenhum administrador cadastrado." } };
    }
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();
    if (email === creds.email && password === creds.password) {
      const mockUser = { email };
      setUser(mockUser);
      setIsAdmin(true);
      localStorage.setItem(SESSION_KEY, JSON.stringify(mockUser));
      return { error: null };
    }
    return { error: { message: "E-mail ou senha incorretos" } };
  };

  const signOut = async () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem(SESSION_KEY);
  };

  return { user, session: null, loading, isAdmin, hasAdmin, signIn, signUp, signOut };
};
