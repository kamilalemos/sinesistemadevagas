import { useCallback, useEffect, useState } from "react";
import { MonitorSmartphone, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const isStandaloneNow = () => {
  if (typeof window === "undefined") return false;
  const mm = window.matchMedia?.("(display-mode: standalone)").matches;
  const mmFs = window.matchMedia?.("(display-mode: fullscreen)").matches;
  const mmMw = window.matchMedia?.("(display-mode: minimal-ui)").matches;
  const iosStandalone =
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  return Boolean(mm || mmFs || mmMw || iosStandalone);
};

const hasInstallSupport = () => {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  // Chromium-based desktop / Android exposes beforeinstallprompt + serviceWorker;
  // iOS Safari supports Add to Home Screen without the prompt event.
  const hasSW = "serviceWorker" in navigator;
  const isChromium = /Chrome|Edg|OPR/.test(ua) && !/Firefox/.test(ua);
  return isIOS || (hasSW && (isChromium || isAndroid));
};

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
  const [installPromptAvailable, setInstallPromptAvailable] = useState(false);

  const evaluate = useCallback(() => {
    if (typeof window === "undefined") return;
    const dismissed =
      window.localStorage.getItem(PWA_GUIDE_STORAGE_KEY) === "true";
    if (dismissed) return setVisible(false);
    if (isStandaloneNow()) return setVisible(false);
    if (!hasInstallSupport() && !installPromptAvailable) return setVisible(false);
    setVisible(true);
  }, [installPromptAvailable]);

  useEffect(() => {
    evaluate();

    // Watch display-mode changes (installation while page is open, iPad multitasking, etc.)
    const mediaQueries = [
      "(display-mode: standalone)",
      "(display-mode: fullscreen)",
      "(display-mode: minimal-ui)",
    ]
      .map((q) => window.matchMedia?.(q))
      .filter(Boolean) as MediaQueryList[];

    const onMedia = () => evaluate();
    mediaQueries.forEach((mq) => mq.addEventListener?.("change", onMedia));

    // Confirms real install support at runtime (Chromium)
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPromptAvailable(true);
    };
    const onInstalled = () => setVisible(false);
    const onReset = () => evaluate();
    const onStorage = (e: StorageEvent) => {
      if (e.key === PWA_GUIDE_STORAGE_KEY) evaluate();
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener(PWA_GUIDE_RESET_EVENT, onReset);
    window.addEventListener("storage", onStorage);

    return () => {
      mediaQueries.forEach((mq) => mq.removeEventListener?.("change", onMedia));
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
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
