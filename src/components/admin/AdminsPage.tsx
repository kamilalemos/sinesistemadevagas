import { useEffect, useState } from "react";
import { Loader2, Shield, Trash2, UserPlus, Pencil, Clock, AlertTriangle, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { ALL_PERMISSIONS, type AdminPermission } from "@/hooks/useAuth";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AdminRow = {
  user_id: string;
  email: string;
  created_at: string;
  permissions: AdminPermission[];
  expires_at: string | null;
};

const PERMISSION_LABELS: Record<AdminPermission, string> = {
  dashboard: "Dashboard",
  "cadastro-vagas": "Cadastro de Vagas",
  visibilidade: "Visibilidade",
  historico: "Histórico Mensal",
  admins: "Administradores",
  configuracoes: "Configurações",
};

const toLocalInputValue = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
};

export const AdminsPage = () => {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUid, setCurrentUid] = useState<string | null>(null);

  // promote form
  const [email, setEmail] = useState("");
  const [newPerms, setNewPerms] = useState<AdminPermission[]>([...ALL_PERMISSIONS]);
  const [newExpires, setNewExpires] = useState("");
  const [busy, setBusy] = useState(false);

  // edit dialog
  const [editing, setEditing] = useState<AdminRow | null>(null);
  const [editPerms, setEditPerms] = useState<AdminPermission[]>([]);
  const [editExpires, setEditExpires] = useState("");
  const [editBusy, setEditBusy] = useState(false);

  // password dialog
  const [pwTarget, setPwTarget] = useState<AdminRow | null>(null);
  const [pwValue, setPwValue] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwBusy, setPwBusy] = useState(false);

  const handleSetPassword = async () => {
    if (!pwTarget) return;
    if (pwValue.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (pwValue !== pwConfirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setPwBusy(true);
    const { data, error } = await supabase.functions.invoke("admin-set-password", {
      body: { user_id: pwTarget.user_id, password: pwValue },
    });
    setPwBusy(false);
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error ?? error?.message ?? "Erro ao alterar senha");
      return;
    }
    toast.success(`Senha de ${pwTarget.email} atualizada.`);
    setPwTarget(null);
    setPwValue("");
    setPwConfirm("");
  };

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

  const togglePerm = (
    list: AdminPermission[],
    setter: (v: AdminPermission[]) => void,
    p: AdminPermission
  ) => {
    setter(list.includes(p) ? list.filter((x) => x !== p) : [...list, p]);
  };

  const handlePromote = async () => {
    if (!email.trim()) return;
    setBusy(true);
    const { error } = await supabase.rpc("promote_admin_by_email", {
      _email: email.trim(),
      _permissions: newPerms,
      _expires_at: newExpires ? new Date(newExpires).toISOString() : null,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Administrador promovido com sucesso!");
    setEmail("");
    setNewExpires("");
    setNewPerms([...ALL_PERMISSIONS]);
    load();
  };

  const openEdit = (a: AdminRow) => {
    setEditing(a);
    setEditPerms(a.permissions ?? []);
    setEditExpires(toLocalInputValue(a.expires_at));
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setEditBusy(true);
    const { error } = await supabase.rpc("update_admin", {
      _user_id: editing.user_id,
      _permissions: editPerms,
      _expires_at: editExpires ? new Date(editExpires).toISOString() : null,
    });
    setEditBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Permissões atualizadas.");
    setEditing(null);
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

  const isExpired = (iso: string | null) =>
    !!iso && new Date(iso) <= new Date();

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
            Controle quem acessa o painel, com quais permissões e até quando.
          </p>
        </div>
      </header>

      {/* Promote */}
      <section className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h2 className="font-heading font-semibold text-foreground">
          Promover novo administrador
        </h2>
        <p className="text-xs text-muted-foreground">
          O usuário precisa ter criado uma conta antes em <code>/admin</code>.
        </p>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">E-mail</Label>
            <Input
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Expira em (opcional)</Label>
            <Input
              type="datetime-local"
              value={newExpires}
              onChange={(e) => setNewExpires(e.target.value)}
              className="rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Permissões</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALL_PERMISSIONS.map((p) => (
              <label
                key={p}
                className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/50 cursor-pointer text-sm"
              >
                <Checkbox
                  checked={newPerms.includes(p)}
                  onCheckedChange={() => togglePerm(newPerms, setNewPerms, p)}
                />
                {PERMISSION_LABELS[p]}
              </label>
            ))}
          </div>
        </div>

        <Button
          onClick={handlePromote}
          disabled={busy || !email.trim() || newPerms.length === 0}
          className="rounded-xl w-full sm:w-auto"
        >
          {busy ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <UserPlus className="w-4 h-4 mr-2" />
          )}
          Promover administrador
        </Button>
      </section>

      {/* List */}
      <section className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-heading font-semibold text-foreground">
            Administradores ativos
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
              const expired = isExpired(a.expires_at);
              return (
                <li
                  key={a.user_id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold text-foreground truncate flex items-center gap-2 flex-wrap">
                      {a.email}
                      {isSelf && (
                        <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          você
                        </span>
                      )}
                      {expired && (
                        <span className="text-[10px] uppercase tracking-wider bg-destructive/10 text-destructive px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> expirado
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {a.expires_at
                        ? `Expira em ${new Date(a.expires_at).toLocaleString("pt-BR")}`
                        : "Sem expiração"}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(a.permissions ?? []).map((p) => (
                        <span
                          key={p}
                          className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                        >
                          {PERMISSION_LABELS[p] ?? p}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(a)}
                      title="Editar permissões"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPwTarget(a);
                        setPwValue("");
                        setPwConfirm("");
                      }}
                      title="Definir nova senha"
                    >
                      <KeyRound className="w-4 h-4" />
                    </Button>
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
                            {a.email} perderá acesso imediatamente.
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
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar administrador</DialogTitle>
            <DialogDescription>{editing?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Expira em (opcional)</Label>
              <Input
                type="datetime-local"
                value={editExpires}
                onChange={(e) => setEditExpires(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Permissões</Label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_PERMISSIONS.map((p) => (
                  <label
                    key={p}
                    className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/50 cursor-pointer text-sm"
                  >
                    <Checkbox
                      checked={editPerms.includes(p)}
                      onCheckedChange={() =>
                        togglePerm(editPerms, setEditPerms, p)
                      }
                    />
                    {PERMISSION_LABELS[p]}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={editBusy || editPerms.length === 0}
            >
              {editBusy && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password dialog */}
      <Dialog open={!!pwTarget} onOpenChange={(o) => !o && setPwTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Definir nova senha</DialogTitle>
            <DialogDescription>
              A senha de <strong>{pwTarget?.email}</strong> será substituída
              imediatamente. Comunique a nova senha em um canal seguro.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Nova senha</Label>
              <Input
                type="password"
                value={pwValue}
                onChange={(e) => setPwValue(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Confirmar nova senha</Label>
              <Input
                type="password"
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwTarget(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSetPassword}
              disabled={pwBusy || !pwValue || !pwConfirm}
            >
              {pwBusy && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Salvar senha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
