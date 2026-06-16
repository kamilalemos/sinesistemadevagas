import { useEffect, useState } from "react";
import { Loader2, Shield, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type AdminRow = { user_id: string; email: string; created_at: string };

export const AdminsPage = () => {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [currentUid, setCurrentUid] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: userData }, { data, error }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.rpc("list_admins"),
    ]);
    setCurrentUid(userData?.user?.id ?? null);
    if (error) toast.error(error.message);
    else setAdmins((data as AdminRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handlePromote = async () => {
    if (!email.trim()) return;
    setBusy(true);
    const { error } = await supabase.rpc("promote_admin_by_email", {
      _email: email.trim(),
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Administrador promovido com sucesso!");
    setEmail("");
    load();
  };

  const handleRemove = async (uid: string) => {
    const { error } = await supabase.rpc("remove_admin", { _user_id: uid });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Acesso de administrador removido.");
    load();
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">
            Administradores
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie quem pode acessar o painel.
          </p>
        </div>
      </header>

      <section className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <h2 className="font-heading font-semibold text-foreground">
          Promover novo administrador
        </h2>
        <p className="text-xs text-muted-foreground">
          O usuário precisa ter criado uma conta antes (
          <code className="text-[11px]">/admin</code>). Informe o e-mail dele
          abaixo.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="email"
            placeholder="email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl"
          />
          <Button
            onClick={handlePromote}
            disabled={busy || !email.trim()}
            className="rounded-xl"
          >
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <UserPlus className="w-4 h-4 mr-2" />
            )}
            Promover
          </Button>
        </div>
      </section>

      <section className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-heading font-semibold text-foreground">
            Lista de administradores
          </h2>
        </div>
        {loading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : admins.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            Nenhum administrador encontrado.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {admins.map((a) => {
              const isSelf = a.user_id === currentUid;
              return (
                <li
                  key={a.user_id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {a.email}
                      {isSelf && (
                        <span className="ml-2 text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          você
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Desde{" "}
                      {new Date(a.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isSelf}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover administrador?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {a.email} perderá acesso ao painel imediatamente.
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemove(a.user_id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};
