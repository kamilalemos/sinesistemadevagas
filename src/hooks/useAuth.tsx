import { useState, useEffect } from "react";

// Mock version that doesn't use Supabase
export const useAuth = () => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("sine_admin_session");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setIsAdmin(true);
    }
    setLoading(false);
  }, []);

  const signIn = async (emailInput: string, passwordInput: string) => {
    // Basic mock authentication with trimming to avoid whitespace issues
    const trimmedEmail = emailInput.trim().toLowerCase();
    const trimmedPassword = passwordInput.trim();

    if (trimmedEmail === "admin@sine.gov.br" && trimmedPassword === "sine2026") {
      const mockUser = { email: trimmedEmail };
      setUser(mockUser);
      setIsAdmin(true);
      localStorage.setItem("sine_admin_session", JSON.stringify(mockUser));
      return { error: null };
    }
    return { error: { message: "Email ou senha incorretos" } };
  };

  const signOut = async () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem("sine_admin_session");
  };

  return { user, session: null, loading, isAdmin, signIn, signOut };
};