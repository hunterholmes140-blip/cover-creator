// ============================================================
// Global content store — arbitrary key/value JSON.
// - Preview (no VITE_API_URL): localStorage per-browser
// - Live (VITE_API_URL set):   PUT /admin/content.php + GET /content.php
// Same hook is used by public pages and admin editors.
// ============================================================

import { useSyncExternalStore } from "react";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "";
const USE_REMOTE = !!API_URL;
const LS_PREFIX = "ns.content.";

type Listener = () => void;
const cache = new Map<string, any>();
const listeners = new Map<string, Set<Listener>>();
const initialized = new Set<string>();

function notify(key: string) {
  listeners.get(key)?.forEach((l) => l());
}

async function fetchRemote(key: string): Promise<any | undefined> {
  try {
    const res = await fetch(`${API_URL}/content.php?key=${encodeURIComponent(key)}`);
    if (!res.ok) return undefined;
    const json = await res.json();
    return json?.data?.value ?? json?.value;
  } catch {
    return undefined;
  }
}

async function saveRemote(key: string, value: any) {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("nextscale_token") : null;
    await fetch(`${API_URL}/admin/content.php`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ key, value }),
    });
  } catch {}
}

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    return raw ? { ...(fallback as any), ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key: string, value: any) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
  } catch {}
}

function ensureInit<T>(key: string, defaults: T) {
  if (initialized.has(key)) return;
  initialized.add(key);
  cache.set(key, readLocal(key, defaults));
  if (USE_REMOTE) {
    fetchRemote(key).then((v) => {
      if (v && typeof v === "object") {
        const merged = { ...(defaults as any), ...v };
        cache.set(key, merged);
        writeLocal(key, merged);
        notify(key);
      }
    });
  }
}

export function useContent<T extends object>(
  key: string,
  defaults: T,
): [T, (patch: Partial<T>) => void, (next: T) => void] {
  ensureInit(key, defaults);

  const value = useSyncExternalStore(
    (l) => {
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key)!.add(l);
      return () => listeners.get(key)!.delete(l);
    },
    () => (cache.get(key) ?? defaults) as T,
    () => defaults,
  );

  const setPatch = (patch: Partial<T>) => {
    const cur = (cache.get(key) ?? defaults) as T;
    const next = { ...cur, ...patch } as T;
    cache.set(key, next);
    writeLocal(key, next);
    notify(key);
    if (USE_REMOTE) saveRemote(key, next);
  };

  const setAll = (next: T) => {
    cache.set(key, next);
    writeLocal(key, next);
    notify(key);
    if (USE_REMOTE) saveRemote(key, next);
  };

  return [value, setPatch, setAll];
}
