import { UserPlus, Users, Loader2, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminEntry {
  user_id: string;
  email: string;
  created_at: string | null;
}

interface Props {
  currentUserId: string;
  // Create admin
  newAdminEmail: string;
  setNewAdminEmail: (v: string) => void;
  newAdminPassword: string;
  setNewAdminPassword: (v: string) => void;
  createLoading: boolean;
  onCreateAdmin: () => void;
  // List admins
  adminList: AdminEntry[];
  adminListLoading: boolean;
  deleteAdminLoading: string | null;
  onFetchAdminList: () => void;
  onDeleteAdmin: (userId: string, email: string) => void;
}

export function SectionAdmins({
  currentUserId,
  newAdminEmail, setNewAdminEmail,
  newAdminPassword, setNewAdminPassword,
  createLoading, onCreateAdmin,
  adminList, adminListLoading, deleteAdminLoading,
  onFetchAdminList, onDeleteAdmin,
}: Props) {
  return (
    <>
      {/* Criar Novo Admin */}
      <div id="section-criar-admin" className="bg-card rounded-xl shadow-card p-5 border border-border space-y-3">
        <div className="flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-primary" />
          <h2 className="font-heading font-semibold text-sm text-foreground">Criar Novo Admin</h2>
        </div>
        <p className="text-xs text-muted-foreground">Cadastre um novo usuário com permissão de administrador</p>
        <Input
          type="email"
          placeholder="Email do novo admin"
          value={newAdminEmail}
          onChange={(e) => setNewAdminEmail(e.target.value)}
          className="rounded-lg text-sm"
        />
        <Input
          type="password"
          placeholder="Senha (mín. 6 caracteres)"
          value={newAdminPassword}
          onChange={(e) => setNewAdminPassword(e.target.value)}
          className="rounded-lg text-sm"
        />
        <Button
          size="sm"
          onClick={onCreateAdmin}
          disabled={createLoading}
          className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-heading text-xs gap-1"
        >
          {createLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
          Criar admin
        </Button>
      </div>

      {/* Listar Admins */}
      <div id="section-listar-admins" className="bg-card rounded-xl shadow-card p-5 border border-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h2 className="font-heading font-semibold text-sm text-foreground">Administradores Cadastrados</h2>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onFetchAdminList}
            disabled={adminListLoading}
            className="rounded-lg text-xs gap-1"
          >
            {adminListLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            Carregar lista
          </Button>
        </div>

        {adminList.length === 0 && !adminListLoading && (
          <p className="text-xs text-muted-foreground text-center py-3">
            Clique em "Carregar lista" para ver os admins cadastrados.
          </p>
        )}

        {adminList.length > 0 && (
          <div className="space-y-2">
            {adminList.map((admin) => (
              <div key={admin.user_id} className="flex items-center justify-between bg-accent/50 rounded-lg px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{admin.email}</p>
                  {admin.created_at && (
                    <p className="text-[10px] text-muted-foreground">
                      Criado em {new Date(admin.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
                {admin.user_id !== currentUserId ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteAdmin(admin.user_id, admin.email)}
                    disabled={deleteAdminLoading === admin.user_id}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                  >
                    {deleteAdminLoading === admin.user_id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                  </Button>
                ) : (
                  <span className="text-[10px] text-muted-foreground italic">Você</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
