import { useEffect, useState } from "react";
import { MonitorSmartphone, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "pwaGuideDismissed";

const steps: { title: string; items: string[] }[] = [
  {
    title: "Google Chrome (Windows e Linux)",
    items: [
      "Clique no ícone Instalar aplicativo na barra de endereços.",
      "Confirme clicando em Instalar.",
      "O sistema será aberto em uma janela própria.",
    ],
  },
  {
    title: "Microsoft Edge",
    items: [
      "Clique no menu (…).",
      "Escolha Aplicativos.",
      "Clique em Instalar este site como aplicativo.",
    ],
  },
  {
    title: "Android (Chrome)",
    items: [
      "Abra o menu do navegador.",
      "Toque em Adicionar à tela inicial ou Instalar aplicativo.",
      "Confirme a instalação.",
    ],
  },
  {
    title: "iPhone / iPad (Safari)",
    items: [
      "Toque no botão Compartilhar.",
      "Selecione Adicionar à Tela de Início.",
      "Confirme.",
    ],
  },
];

export const PWAInstallGuideCard = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const dismissed = window.localStorage.getItem(STORAGE_KEY) === "true";
    if (dismissed) return;

    // Already installed as PWA
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // iOS Safari
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    // Basic support heuristic (Service Worker OR iOS Safari)
    const isIOS = /iPad|iPhone|iPod/.test(window.navigator.userAgent);
    const supportsInstall = "serviceWorker" in navigator || isIOS;
    if (!supportsInstall) return;

    setVisible(true);
  }, []);

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Card className="rounded-xl shadow-card">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
          <MonitorSmartphone className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base">📱 Instale o Painel do SINE</CardTitle>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Instale este sistema como aplicativo em seu computador ou celular para
            acessar o painel mais rapidamente, com uma experiência semelhante a um
            aplicativo nativo.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((group) => (
            <div
              key={group.title}
              className="rounded-xl border border-border bg-muted/30 p-4"
            >
              <h4 className="font-heading font-semibold text-sm text-foreground mb-2">
                {group.title}
              </h4>
              <ol className="space-y-1.5 list-decimal list-inside text-sm text-muted-foreground">
                {group.items.map((item, i) => (
                  <li key={i} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={dismiss}
            className="rounded-xl"
          >
            <Check className="w-4 h-4 mr-2" />
            Entendi
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
