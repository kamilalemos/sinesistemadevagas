import { useCallback, useEffect, useState } from "react";
import { Smartphone, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const PWA_GUIDE_STORAGE_KEY = "pwaGuideDismissed";
export const PWA_GUIDE_RESET_EVENT = "pwa-guide-reset";

/** Emit a same-tab event so open Dashboard instances re-check visibility. */
export const resetPWAGuide = () => {
  try {
    window.localStorage.removeItem(PWA_GUIDE_STORAGE_KEY);
  } catch {}
  window.dispatchEvent(new CustomEvent(PWA_GUIDE_RESET_EVENT));
};

const isInstalledNow = () => {
  if (typeof window === "undefined") return false;
  const mm = window.matchMedia?.("(display-mode: standalone)").matches;
  const iosStandalone =
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  return Boolean(mm || iosStandalone);
};

export const PWAInstallGuideCard = () => {
  const [visible, setVisible] = useState(false);

  const evaluate = useCallback(() => {
    if (typeof window === "undefined") return;
    const dismissed =
      window.localStorage.getItem(PWA_GUIDE_STORAGE_KEY) === "true";
    if (dismissed) return setVisible(false);
    if (isInstalledNow()) return setVisible(false);
    setVisible(true);
  }, []);

  useEffect(() => {
    evaluate();

    const mq = window.matchMedia?.("(display-mode: standalone)");
    const onMedia = () => evaluate();
    mq?.addEventListener?.("change", onMedia);

    const onInstalled = () => setVisible(false);
    const onReset = () => evaluate();
    const onStorage = (e: StorageEvent) => {
      if (e.key === PWA_GUIDE_STORAGE_KEY) evaluate();
    };

    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener(PWA_GUIDE_RESET_EVENT, onReset);
    window.addEventListener("storage", onStorage);

    return () => {
      mq?.removeEventListener?.("change", onMedia);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener(PWA_GUIDE_RESET_EVENT, onReset);
      window.removeEventListener("storage", onStorage);
    };
  }, [evaluate]);

  const dismiss = () => {
    try {
      window.localStorage.setItem(PWA_GUIDE_STORAGE_KEY, "true");
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Card className="rounded-xl shadow-card animate-fade-in">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <h3 className="font-heading font-bold text-base text-foreground">
                📱 Instale o aplicativo
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                Acesse o sistema mais rapidamente instalando o aplicativo na tela
                inicial do seu computador ou celular.
              </p>
            </div>

            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li>
                <span className="font-semibold text-foreground">Windows (Chrome ou Edge):</span>{" "}
                clique no ícone <span className="font-semibold">Instalar</span> na barra de endereços.
              </li>
              <li>
                <span className="font-semibold text-foreground">Android:</span>{" "}
                abra o menu do navegador e toque em{" "}
                <span className="font-semibold">Adicionar à tela inicial</span> ou{" "}
                <span className="font-semibold">Instalar aplicativo</span>.
              </li>
              <li>
                <span className="font-semibold text-foreground">iPhone (Safari):</span>{" "}
                toque em <span className="font-semibold">Compartilhar</span> e depois em{" "}
                <span className="font-semibold">Adicionar à Tela de Início</span>.
              </li>
            </ul>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={dismiss} className="rounded-lg">
                <Check className="w-4 h-4 mr-2" />
                Entendi
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
