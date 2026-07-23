// ============================================================
// Live admin data store — বাস্তব API-এর সাথে কথা বলে।
// - LIVE mode (published site / VITE_API_URL set): /api/admin/*.php-তে fetch করে
// - PREVIEW mode (Lovable iframe): admin-store (localStorage) fallback
// একই hook shape → admin routes নির্বিঘ্নে সুইচ করতে পারে।
// ============================================================

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useCourses as useLocalCourses,
  useCategories as useLocalCategories,
  useOrders as useLocalOrders,
  useUsers as useLocalUsers,
} from "./admin-store";

function detectLive(): boolean {
  const envUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? "";
  if (envUrl) return true;
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return !(h.includes("lovableproject.com") || h.startsWith("id-preview--"));
}
export const USE_REMOTE = detectLive();
const API_URL =
  ((import.meta.env.VITE_API_URL as string | undefined) ?? "").replace(/\/$/, "") ||
  (USE_REMOTE ? "/api" : "");

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("nextscale_token") : null;
}

async function apiCall<T>(
  path: string,
  opts: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: any;
    query?: Record<string, string | number | undefined>;
  } = {},
): Promise<T> {
  const { method = "GET", body, query } = opts;
  let url = `${API_URL}/${path.replace(/^\//, "")}`;
  if (query) {
    const q = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => v !== undefined && q.set(k, String(v)));
    const qs = q.toString();
    if (qs) url += (url.includes("?") ? "&" : "?") + qs;
  }
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const t = getToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.error || `Error ${res.status}`);
  }
  return (json.data ?? json) as T;
}

export type LiveHook<T> = {
  items: T[];
  loading: boolean;
  error: string | null;
  get: (id: any) => T | undefined;
  add: (item: Partial<T>) => Promise<T | null>;
  update: (id: any, patch: Partial<T>) => Promise<void>;
  remove: (id: any) => Promise<void>;
  refresh: () => Promise<void>;
};

type Endpoint = {
  path: string; // e.g. "admin/courses.php"
  listKey: string; // e.g. "courses"
  supportsCreate?: boolean;
};

function useRemoteCollection<T extends { id: any }>(
  endpoint: Endpoint,
  enabled: boolean,
): LiveHook<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiCall<any>(endpoint.path);
      setItems((data && data[endpoint.listKey]) || []);
    } catch (e: any) {
      setError(e?.message || "ডেটা লোড করা যায়নি");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [enabled, endpoint.path, endpoint.listKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(
    async (item: Partial<T>) => {
      if (endpoint.supportsCreate === false) throw new Error("Create সাপোর্ট করে না");
      const tempId = `tmp_${Date.now()}`;
      const optimistic = { ...(item as any), id: tempId } as T;
      setItems((prev) => [optimistic, ...prev]);
      try {
        const res = await apiCall<{ id: any }>(endpoint.path, { method: "POST", body: item });
        setItems((prev) =>
          prev.map((r) => (String((r as any).id) === tempId ? ({ ...(r as any), id: res.id } as T) : r)),
        );
        refresh(); // background reconcile
        return { ...(item as any), id: res.id } as T;
      } catch (e) {
        setItems((prev) => prev.filter((r) => String((r as any).id) !== tempId));
        throw e;
      }
    },
    [endpoint.path, endpoint.supportsCreate, refresh],
  );

  const update = useCallback(
    async (id: any, patch: Partial<T>) => {
      let snapshot: T[] = [];
      setItems((prev) => {
        snapshot = prev;
        return prev.map((r) =>
          String((r as any).id) === String(id) ? ({ ...(r as any), ...patch } as T) : r,
        );
      });
      const cur = snapshot.find((i) => String((i as any).id) === String(id));
      const body = { ...(cur || {}), ...patch, id };
      try {
        await apiCall(endpoint.path, { method: "PUT", body });
        refresh();
      } catch (e) {
        setItems(snapshot);
        throw e;
      }
    },
    [endpoint.path, refresh],
  );

  const remove = useCallback(
    async (id: any) => {
      let snapshot: T[] = [];
      setItems((prev) => {
        snapshot = prev;
        return prev.filter((r) => String((r as any).id) !== String(id));
      });
      try {
        await apiCall(endpoint.path, { method: "DELETE", query: { id } });
        refresh();
      } catch (e) {
        setItems(snapshot);
        throw e;
      }
    },
    [endpoint.path, refresh],
  );

  return useMemo(
    () => ({
      items,
      loading,
      error,
      refresh,
      get: (id: any) => items.find((i) => String((i as any).id) === String(id)),
      add,
      update,
      remove,
    }),
    [items, loading, error, refresh, add, update, remove],
  );
}

// Wraps a local admin-store hook (synchronous) in the async LiveHook shape.
function toLocalHook<T extends { id: any }>(local: {
  items: T[];
  add: (i: Partial<T>) => T;
  update: (id: any, p: Partial<T>) => void;
  remove: (id: any) => void;
}): LiveHook<T> {
  return {
    items: local.items,
    loading: false,
    error: null,
    get: (id: any) => local.items.find((i) => String((i as any).id) === String(id)),
    add: async (i) => local.add(i),
    update: async (id, p) => local.update(id, p),
    remove: async (id) => local.remove(id),
    refresh: async () => {},
  };
}

// ---------- Public hooks (drop-in replacements) ----------

export function useLiveCourses(): LiveHook<any> {
  const local = useLocalCourses();
  const remote = useRemoteCollection<any>(
    { path: "admin/courses.php", listKey: "courses" },
    USE_REMOTE,
  );
  const localAdapted = useMemo(() => toLocalHook<any>(local), [local]);
  return USE_REMOTE ? remote : localAdapted;
}

export function useLiveCategories(): LiveHook<any> {
  const local = useLocalCategories();
  const remote = useRemoteCollection<any>(
    { path: "admin/categories.php", listKey: "categories" },
    USE_REMOTE,
  );
  const localAdapted = useMemo(() => toLocalHook<any>(local), [local]);
  return USE_REMOTE ? remote : localAdapted;
}

export function useLiveOrders(): LiveHook<any> {
  const local = useLocalOrders();
  const remote = useRemoteCollection<any>(
    { path: "admin/orders.php", listKey: "orders", supportsCreate: false },
    USE_REMOTE,
  );
  const localAdapted = useMemo(() => toLocalHook<any>(local), [local]);
  return USE_REMOTE ? remote : localAdapted;
}

export function useLiveUsers(): LiveHook<any> {
  const local = useLocalUsers();
  const remote = useRemoteCollection<any>(
    { path: "admin/users.php", listKey: "users", supportsCreate: false },
    USE_REMOTE,
  );
  const localAdapted = useMemo(() => toLocalHook<any>(local), [local]);
  return USE_REMOTE ? remote : localAdapted;
}
