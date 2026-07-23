import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type SiteSettings = {
  brandName: string;
  brandTagline: string;
  whatsappNumber: string; // international format, e.g. 8801700000000
  phoneNumber: string;
  email: string;
  facebookUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  // Colors — HSL values only (space separated) to match Tailwind theme tokens
  primaryHsl: string;      // e.g. "262 83% 58%"
  accentHsl: string;
  footerFrom: string;      // hex or CSS color
  footerVia: string;
  footerTo: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  brandName: "NextScale",
  brandTagline: "একজনকে মাছ ধরে দিলে সে একদিন খেতে পারবে; মাছ ধরা শেখালে সারাজীবন। আমরা শেখাই — সারাজীবনের জন্য।",
  whatsappNumber: "8801700000000",
  phoneNumber: "+8801700000000",
  email: "support@nextscale.com",
  facebookUrl: "#",
  youtubeUrl: "#",
  instagramUrl: "#",
  linkedinUrl: "#",
  primaryHsl: "262 83% 58%",
  accentHsl: "292 84% 61%",
  footerFrom: "#2a1170",
  footerVia: "#3d1a8a",
  footerTo: "#5b21b6",
};

const STORAGE_KEY = "nextscale.site-settings.v1";

type Ctx = {
  settings: SiteSettings;
  update: (patch: Partial<SiteSettings>) => void;
  reset: () => void;
};

const SiteSettingsContext = createContext<Ctx | null>(null);

function loadSettings(): SiteSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function applyCssVars(s: SiteSettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--primary", s.primaryHsl);
  root.style.setProperty("--accent", s.accentHsl);
  root.style.setProperty("--ring", s.primaryHsl);
  root.style.setProperty("--footer-from", s.footerFrom);
  root.style.setProperty("--footer-via", s.footerVia);
  root.style.setProperty("--footer-to", s.footerTo);
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
    applyCssVars(loaded);
  }, []);

  const update = useCallback((patch: Partial<SiteSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      applyCssVars(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setSettings(DEFAULT_SETTINGS);
    applyCssVars(DEFAULT_SETTINGS);
  }, []);

  const value = useMemo(() => ({ settings, update, reset }), [settings, update, reset]);

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error("useSiteSettings must be used within SiteSettingsProvider");
  return ctx;
}

export function whatsappLink(number: string, text?: string) {
  const cleaned = number.replace(/[^\d]/g, "");
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${cleaned}${q}`;
}
