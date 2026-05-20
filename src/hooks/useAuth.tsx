import { useState, useEffect } from "react";

export const useAuth = () => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("sine_admin_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAdmin(true);
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Simulação simples de login local
    if (email && password) {
      const mockUser = { email };
      setUser(mockUser);
      setIsAdmin(true);
      localStorage.setItem("sine_admin_user", JSON.stringify(mockUser));
      return { error: null };
    }
    return { error: new Error("Credenciais inválidas") };
  };

  const signOut = async () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem("sine_admin_user");
  };

  return { user, loading, isAdmin, signIn, signOut };
};
