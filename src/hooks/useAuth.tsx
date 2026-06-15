import { useState, useEffect } from "react";
import { STORAGE_KEYS } from "@/constants/storageKeys";

const CREDENTIALS_KEY = STORAGE_KEYS.ADMIN_CREDENTIALS;
const SESSION_KEY = STORAGE_KEYS.ADMIN_SESSION;
const ATTEMPTS_KEY = STORAGE_KEYS.ADMIN_LOGIN_ATTEMPTS;

const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8h
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15min

type StoredCredentials = { email: string; password: string };
type StoredSession = { email: string; expiresAt?: number };
interface LoginAttempts {
  count: number;
  lockoutUntil: number | null;
}

async function hashSenha(senha: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(senha)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const readCredentials = (): StoredCredentials | null => {
  const raw = localStorage.getItem(CREDENTIALS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const writeCredentials = (creds: StoredCredentials) => {
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));
};

const readSession = (): StoredSession | null => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const getAttempts = (): LoginAttempts => {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return { count: 0, lockoutUntil: null };
    return JSON.parse(raw) ?? { count: 0, lockoutUntil: null };
  } catch {
    return { count: 0, lockoutUntil: null };
  }
};

const setAttempts = (data: LoginAttempts) => {
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(data));
};

const resetAttempts = () => {
  localStorage.removeItem(ATTEMPTS_KEY);
};

export const useAuth = () => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasAdmin, setHasAdmin] = useState(false);

  useEffect(() => {
    setHasAdmin(!!readCredentials());
    const saved = readSession();
    if (saved) {
      if (saved.expiresAt && Date.now() > saved.expiresAt) {
        localStorage.removeItem(SESSION_KEY);
      } else {
        setUser({ email: saved.email });
        setIsAdmin(true);
      }
    }
    setLoading(false);
  }, []);

  const persistSession = (email: string) => {
    const sessao: StoredSession = {
      email,
      expiresAt: Date.now() + SESSION_TTL_MS,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessao));
  };

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
    const hashed = await hashSenha(password);
    writeCredentials({ email, password: hashed });
    persistSession(email);
    setUser({ email });
    setIsAdmin(true);
    setHasAdmin(true);
    return { error: null };
  };

  const signIn = async (emailInput: string, passwordInput: string) => {
    const attempts = getAttempts();
    if (attempts.lockoutUntil && Date.now() < attempts.lockoutUntil) {
      const minutosRestantes = Math.ceil(
        (attempts.lockoutUntil - Date.now()) / 60000
      );
      return {
        error: {
          message: `Muitas tentativas. Tente novamente em ${minutosRestantes} min.`,
        },
      };
    }

    const creds = readCredentials();
    if (!creds) {
      return { error: { message: "Nenhum administrador cadastrado." } };
    }
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();

    const hashed = await hashSenha(password);
    let matched = email === creds.email && hashed === creds.password;

    // Fallback de migração: senha antiga em plain text
    if (!matched && email === creds.email && password === creds.password) {
      matched = true;
      writeCredentials({ email: creds.email, password: hashed });
    }

    if (matched) {
      resetAttempts();
      setUser({ email });
      setIsAdmin(true);
      persistSession(email);
      return { error: null };
    }

    const novoCount = (attempts.count ?? 0) + 1;
    setAttempts({
      count: novoCount,
      lockoutUntil: novoCount >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : null,
    });
    return { error: { message: "E-mail ou senha incorretos" } };
  };

  const signOut = async () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem(SESSION_KEY);
  };

  return { user, session: null, loading, isAdmin, hasAdmin, signIn, signUp, signOut };
};
