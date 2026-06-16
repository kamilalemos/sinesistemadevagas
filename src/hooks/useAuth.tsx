import { useState, useEffect } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasAdmin, setHasAdmin] = useState(true);

  const refreshSetupFlag = async () => {
    const { data, error } = await supabase.rpc("is_setup_needed");
    if (!error) setHasAdmin(!data);
  };

  const refreshAdminFlag = async (uid: string | undefined) => {
    if (!uid) {
      setIsAdmin(false);
      return;
    }
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: uid,
      _role: "admin",
    });
    setIsAdmin(!error && !!data);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      // Defer admin check to avoid deadlocks inside the callback
      setTimeout(() => {
        refreshAdminFlag(sess?.user?.id);
        refreshSetupFlag();
      }, 0);
    });

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      Promise.all([refreshAdminFlag(sess?.user?.id), refreshSetupFlag()]).finally(
        () => setLoading(false)
      );
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (emailInput: string, passwordInput: string) => {
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();
    if (!email || !password) {
      return { error: { message: "Preencha e-mail e senha." } };
    }
    if (password.length < 6) {
      return { error: { message: "A senha deve ter pelo menos 6 caracteres." } };
    }

    // Block if an admin already exists
    const { data: setupNeeded } = await supabase.rpc("is_setup_needed");
    if (!setupNeeded) {
      return { error: { message: "Já existe um administrador cadastrado." } };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    if (error) return { error: { message: error.message } };

    // If session is available (auto-confirm on), promote to admin now
    if (data.session) {
      const { error: rpcErr } = await supabase.rpc("setup_first_admin");
      if (rpcErr) return { error: { message: rpcErr.message } };
      await refreshAdminFlag(data.user?.id);
      await refreshSetupFlag();
    }
    return { error: null };
  };

  const signIn = async (emailInput: string, passwordInput: string) => {
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: { message: error.message } };

    // Safety net: if this user is the first one and no admin exists, promote.
    const { data: setupNeeded } = await supabase.rpc("is_setup_needed");
    if (setupNeeded && data.user) {
      await supabase.rpc("setup_first_admin");
    }
    await refreshAdminFlag(data.user?.id);
    await refreshSetupFlag();
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setUser(null);
    setSession(null);
  };

  return { user, session, loading, isAdmin, hasAdmin, signIn, signUp, signOut };
};
