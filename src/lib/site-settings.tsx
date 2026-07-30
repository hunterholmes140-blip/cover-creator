import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useContent } from "./content-store";

export type SiteSettings = {
  brandName: string;
  siteTitle: string;
  brandTagline: string;
  whatsappNumber: string; // international format, e.g. 8801700000000
  phoneNumber: string;
  email: string;
  facebookUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  threadsUrl: string;
  affiliateUrl: string; // Dynamic URL for affiliate account link
  // Colors — HSL values only (space separated) to match Tailwind theme tokens
  primaryHsl: string;
  accentHsl: string;
  footerFrom: string;
  footerVia: string;
  footerTo: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  brandName: "Vencon",
  siteTitle: "Vencon Academy — বাংলাদেশের অনলাইন লার্নিং প্ল্যাটফর্ম",
  brandTagline:
    "একজনকে মাছ ধরে দিলে সে একদিন খেতে পারবে; মাছ ধরা শেখালে সারাজীবন। আমরা শেখাই — সারাজীবনের জন্য।",
  whatsappNumber: "8801729690835",
  phoneNumber: "+8801729690835",
  email: "support@vencon.com.bd",
  facebookUrl: "#",
  youtubeUrl: "#",
  instagramUrl: "#",
  linkedinUrl: "#",
  threadsUrl: "#",
  affiliateUrl: "/affiliate",
  primaryHsl: "29 93% 54%",
  accentHsl: "38 96% 58%",
  footerFrom: "#1a1006",
  footerVia: "#2d1a08",
  footerTo: "#5a2f0c",
};

// Content-store key — same key is read by public pages and written by admin.
const SETTINGS_KEY = "site_settings";

type Ctx = {
  settings: SiteSettings;
  update: (patch: Partial<SiteSettings>) => void;
  reset: () => void;
};

const SiteSettingsContext = createContext<Ctx | null>(null);

function applyCssVars(s: SiteSettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--primary", `hsl(${s.primaryHsl})`);
  root.style.setProperty("--accent", `hsl(${s.accentHsl})`);
  root.style.setProperty("--ring", `hsl(${s.primaryHsl})`);
  root.style.setProperty("--footer-from", s.footerFrom);
  root.style.setProperty("--footer-via", s.footerVia);
  root.style.setProperty("--footer-to", s.footerTo);

  if (s.siteTitle && s.siteTitle.trim()) {
    document.title = s.siteTitle.trim();
  }
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setPatch, setAll] = useContent<SiteSettings>(
    SETTINGS_KEY,
    DEFAULT_SETTINGS,
  );

  useEffect(() => {
    applyCssVars(settings);
  }, [settings]);

  const update = useCallback(
    (patch: Partial<SiteSettings>) => setPatch(patch),
    [setPatch],
  );

  const reset = useCallback(() => setAll(DEFAULT_SETTINGS), [setAll]);

  const value = useMemo(() => ({ settings, update, reset }), [settings, update, reset]);

  return (
    <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
  );
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
