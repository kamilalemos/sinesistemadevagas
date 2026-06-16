import { useState } from "react";
import { Loader2, KeyRound, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export const ChangePasswordCard = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setBusy(true);
    try {
      // Re-autentica para confirmar a senha atual
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email;
      if (!email) {
        toast.error("Sessão inválida.");
        return;
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (signInError) {
        toast.error("Senha atual incorreta.");
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="rounded-[2rem] border-border/60 shadow-card overflow-hidden">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="font-heading font-black text-xl">
              Alterar Senha
            </CardTitle>
            <CardDescription>
              Atualize sua senha de acesso ao painel.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-2 space-y-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Senha atual</Label>
            <Input
              type={show ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Nova senha</Label>
            <Input
              type={show ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Confirmar nova senha</Label>
            <Input
              type={show ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-xl"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            {show ? (
              <>
                <EyeOff className="w-3.5 h-3.5" /> Ocultar senhas
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" /> Mostrar senhas
              </>
            )}
          </button>
          <Button
            onClick={handleSubmit}
            disabled={
              busy ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword
            }
            className="rounded-xl"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Salvar nova senha
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
