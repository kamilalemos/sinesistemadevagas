import { useEffect, useState } from "react";
import { Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

const isInstalledNow = () => {
  if (typeof window === "undefined") return false;
  const mm = window.matchMedia?.("(display-mode: standalone)").matches;
  const iosStandalone =
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  return Boolean(mm || iosStandalone);
};

export const PWAInstallBanner = () => {
  const [installed, setInstalled] = useState(true);

  useEffect(() => {
    setInstalled(isInstalledNow());
    const mq = window.matchMedia?.("(display-mode: standalone)");
    const onChange = () => setInstalled(isInstalledNow());
    mq?.addEventListener?.("change", onChange);
    const onInstalled = () => setInstalled(true);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      mq?.removeEventListener?.("change", onChange);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  return (
    <section className="px-4">
      <div className="container mx-auto">
        <div className="bg-card border border-border rounded-xl shadow-card px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-heading font-bold text-sm text-foreground">
                📱 Instale o App
              </h3>
              <p className="text-xs text-muted-foreground leading-snug">
                Tenha acesso rápido às vagas do SINE instalando o aplicativo na tela inicial do seu dispositivo.
              </p>
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="rounded-lg font-heading font-semibold shrink-0 w-full sm:w-auto"
              >
                Como instalar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-heading">Instale o aplicativo</DialogTitle>
                <DialogDescription>
                  Você pode acessar o portal como um aplicativo no computador ou celular.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm text-foreground">
                <div>
                  <p className="font-semibold">Windows (Chrome ou Edge)</p>
                  <p className="text-muted-foreground">
                    Clique no ícone <span className="font-semibold text-foreground">Instalar</span> que aparece na barra de endereços.
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Android</p>
                  <p className="text-muted-foreground">
                    Abra o menu do navegador e toque em{" "}
                    <span className="font-semibold text-foreground">Adicionar à tela inicial</span> ou{" "}
                    <span className="font-semibold text-foreground">Instalar aplicativo</span>.
                  </p>
                </div>
                <div>
                  <p className="font-semibold">iPhone (Safari)</p>
                  <p className="text-muted-foreground">
                    Toque em <span className="font-semibold text-foreground">Compartilhar</span> e depois em{" "}
                    <span className="font-semibold text-foreground">Adicionar à Tela de Início</span>.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" className="rounded-lg w-full sm:w-auto">
                    Fechar
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
};
