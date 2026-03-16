import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  userEmail: string;
  newPassword: string;
  setNewPassword: (v: string) => void;
  loading: boolean;
  onChangePassword: () => void;
}

export function SectionSenha({ userEmail, newPassword, setNewPassword, loading, onChangePassword }: Props) {
  return (
    <div id="section-alterar-senha" className="bg-card rounded-xl shadow-card p-5 border border-border space-y-3">
      <div className="flex items-center gap-2">
        <KeyRound className="w-4 h-4 text-secondary" />
        <h2 className="font-heading font-semibold text-sm text-foreground">Alterar Senha</h2>
      </div>
      <p className="text-xs text-muted-foreground">Altere a senha da sua conta admin atual ({userEmail})</p>
      <Input
        type="password"
        placeholder="Nova senha (mín. 6 caracteres)"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="rounded-lg text-sm"
      />
      <Button
        size="sm"
        onClick={onChangePassword}
        disabled={loading}
        className="rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 font-heading text-xs gap-1"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <KeyRound className="w-3 h-3" />}
        Alterar senha
      </Button>
    </div>
  );
}
