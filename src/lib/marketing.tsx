// ============================================================
// Marketing / Facebook Pixel integration
// - Pixel ID, Domain verification, CAPI token, Test Event Code
// - সব সেটিংস এডমিন প্যানেল থেকে নিয়ন্ত্রন হয়
// - PageView অটো ফায়ার, বাকি ইভেন্ট track() দিয়ে
// ============================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useRouterState } from "@tanstack/react-router";
import { useContent } from "./content-store";

export type MarketingSettings = {
  fb_pixel_id: string;
  fb_domain_verification: string; // meta content= value from Meta Business Suite
  fb_capi_token: string;          // server-side Conversions API access token (future use)
  fb_test_event_code: string;     // TEST12345 — Meta Events Manager Test Events
  fb_auto_pageview: boolean;
  fb_advanced_matching: boolean;  // hash email/phone
  // Google (bonus — একই জায়গা থেকে সব মার্কেটিং ট্যাগ)
  ga_measurement_id: string;      // G-XXXXXXXXXX
  gtm_container_id: string;       // GTM-XXXXXXX
};

export const DEFAULT_MARKETING: MarketingSettings = {
  fb_pixel_id: "",
  fb_domain_verification: "",
  fb_capi_token: "",
  fb_test_event_code: "",
  fb_auto_pageview: true,
  fb_advanced_matching: false,
  ga_measurement_id: "",
  gtm_container_id: "",
};

const KEY = "marketing_settings";

type Ctx = {
  settings: MarketingSettings;
  update: (patch: Partial<MarketingSettings>) => void;
  reset: () => void;
  /** Fire a Facebook Pixel standard/custom event */
  track: (event: string, params?: Record<string, any>, eventId?: string) => void;
};

const MarketingCtx = createContext<Ctx | null>(null);

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

function injectPixel(pixelId: string, advancedMatching: boolean) {
  if (typeof window === "undefined" || !pixelId) return;
  if (window.fbq) {
    try { window.fbq("init", pixelId); } catch { /* noop */ }
    return;
  }
  // Meta Pixel base code
  /* eslint-disable */
  (function (f: any, b, e, v, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
    t = b.createElement(e); t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */
  window.fbq("init", pixelId, advancedMatching ? {} : undefined);
}

function injectGA(id: string) {
  if (typeof window === "undefined" || !id || document.getElementById("ga4-script")) return;
  const s = document.createElement("script");
  s.id = "ga4-script"; s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer!.push(arguments as any); };
  window.gtag("js", new Date());
  window.gtag("config", id);
}

function injectGTM(id: string) {
  if (typeof window === "undefined" || !id || document.getElementById("gtm-script")) return;
  const s = document.createElement("script");
  s.id = "gtm-script";
  s.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');`;
  document.head.appendChild(s);
}

function upsertMeta(name: string, content: string) {
  if (typeof document === "undefined") return;
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!content) { tag?.remove(); return; }
  if (!tag) {
    tag = document.createElement("meta");
    tag.name = name;
    document.head.appendChild(tag);
  }
  tag.content = content;
}

export function MarketingProvider({ children }: { children: ReactNode }) {
  const [settings, setPatch, setAll] = useContent<MarketingSettings>(KEY, DEFAULT_MARKETING);
  const initedPixel = useRef<string>("");

  // Inject tags whenever settings change
  useEffect(() => {
    if (settings.fb_pixel_id && initedPixel.current !== settings.fb_pixel_id) {
      injectPixel(settings.fb_pixel_id, settings.fb_advanced_matching);
      initedPixel.current = settings.fb_pixel_id;
    }
    if (settings.ga_measurement_id) injectGA(settings.ga_measurement_id);
    if (settings.gtm_container_id) injectGTM(settings.gtm_container_id);
    upsertMeta("facebook-domain-verification", settings.fb_domain_verification || "");
  }, [
    settings.fb_pixel_id,
    settings.fb_advanced_matching,
    settings.ga_measurement_id,
    settings.gtm_container_id,
    settings.fb_domain_verification,
  ]);

  // Auto PageView on route change
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    if (!settings.fb_auto_pageview || !settings.fb_pixel_id || typeof window === "undefined") return;
    if (!window.fbq) return;
    const opts: any = {};
    if (settings.fb_test_event_code) opts.eventID = undefined; // Pixel uses test via query
    window.fbq("track", "PageView");
    if (window.gtag && settings.ga_measurement_id) {
      window.gtag("event", "page_view", { page_path: pathname });
    }
  }, [pathname, settings.fb_auto_pageview, settings.fb_pixel_id, settings.fb_test_event_code, settings.ga_measurement_id]);

  const track = useCallback(
    (event: string, params?: Record<string, any>, eventId?: string) => {
      if (typeof window === "undefined" || !window.fbq || !settings.fb_pixel_id) return;
      const opts: any = {};
      if (eventId) opts.eventID = eventId;
      // Standard vs custom
      const std = new Set([
        "PageView", "ViewContent", "Search", "AddToCart", "AddToWishlist",
        "InitiateCheckout", "AddPaymentInfo", "Purchase", "Lead",
        "CompleteRegistration", "Contact", "Subscribe", "StartTrial", "Schedule",
      ]);
      const type = std.has(event) ? "track" : "trackCustom";
      try {
        if (params && opts.eventID) window.fbq(type, event, params, opts);
        else if (params) window.fbq(type, event, params);
        else window.fbq(type, event);
      } catch { /* noop */ }
    },
    [settings.fb_pixel_id],
  );

  const update = useCallback((patch: Partial<MarketingSettings>) => setPatch(patch), [setPatch]);
  const reset = useCallback(() => setAll(DEFAULT_MARKETING), [setAll]);

  const value = useMemo(() => ({ settings, update, reset, track }), [settings, update, reset, track]);
  return <MarketingCtx.Provider value={value}>{children}</MarketingCtx.Provider>;
}

export function useMarketing() {
  const ctx = useContext(MarketingCtx);
  if (!ctx) throw new Error("useMarketing must be used within MarketingProvider");
  return ctx;
}

/** Convenience — safe no-op when provider is missing */
export function track(event: string, params?: Record<string, any>) {
  if (typeof window === "undefined" || !window.fbq) return;
  const std = new Set([
    "PageView", "ViewContent", "Search", "AddToCart", "AddToWishlist",
    "InitiateCheckout", "AddPaymentInfo", "Purchase", "Lead",
    "CompleteRegistration", "Contact", "Subscribe", "StartTrial", "Schedule",
  ]);
  const type = std.has(event) ? "track" : "trackCustom";
  try {
    if (params) window.fbq(type, event, params);
    else window.fbq(type, event);
  } catch { /* noop */ }
}
