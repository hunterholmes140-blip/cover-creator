// ============================================================
// NextScale API Client
// Hostinger PHP ব্যাকএন্ডের সাথে কথা বলে
// ============================================================
// প্রোডাকশনে .env-এ VITE_API_URL="https://yourdomain.com/api" সেট করুন
// Lovable প্রিভিউতে PHP নেই → fetch fail হলে mock data দেখাই
// ============================================================

import { MOCK_COURSES, MOCK_CATEGORIES, MOCK_SETTINGS, MOCK_TRAINERS, MOCK_TESTIMONIALS, MOCK_FAQS, MOCK_POSTS } from "./mock-data";
import {
  coursesStore, categoriesStore, trainersStore, blogStore,
  testimonialsStore, faqsStore,
} from "./admin-store";

// In preview (no VITE_API_URL) we serve data from the admin-store so anything
// edited in /admin/* immediately shows up on the public site. Falls back to
// the original mock arrays when a store hasn't been seeded/hydrated yet.
function fromStore<T>(getter: () => T[], fallback: T[]): T[] {
  try {
    const items = getter();
    return items && items.length ? items : fallback;
  } catch { return fallback; }
}

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "";
const USE_MOCK = !API_URL;

const TOKEN_KEY = "nextscale_token";
const USER_KEY = "nextscale_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): any | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setStoredUser(user: any) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

type ApiOpts = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  query?: Record<string, string | number | undefined>;
  auth?: boolean;
};

export class ApiError extends Error {
  status: number;
  constructor(msg: string, status = 400) {
    super(msg);
    this.status = status;
  }
}

export async function api<T = any>(path: string, opts: ApiOpts = {}): Promise<T> {
  const { method = "GET", body, query, auth = false } = opts;

  if (USE_MOCK) {
    return mockResponse<T>(path, { method, body, query });
  }

  let url = `${API_URL}/${path.replace(/^\//, "")}`;
  if (query) {
    const q = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => v !== undefined && q.set(k, String(v)));
    const qs = q.toString();
    if (qs) url += (url.includes("?") ? "&" : "?") + qs;
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("সার্ভারের সাথে সংযোগ করা যাচ্ছে না।", 0);
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new ApiError(json.error || `Error ${res.status}`, res.status);
  }
  return (json.data ?? json) as T;
}

// ============================================================
// MOCK RESPONSE (Lovable প্রিভিউতে)
// ============================================================
async function mockResponse<T>(path: string, opts: any): Promise<T> {
  await new Promise((r) => setTimeout(r, 250));
  const p = path.replace(/^\//, "");

  if (p === "courses/list.php") {
    let list = [...MOCK_COURSES];
    if (opts.query?.featured) list = list.filter((c) => c.is_featured);
    if (opts.query?.category) list = list.filter((c) => c.category_slug === opts.query.category);
    if (opts.query?.search) {
      const q = String(opts.query.search).toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q));
    }
    return { courses: list } as T;
  }

  if (p === "courses/categories.php") {
    return { categories: MOCK_CATEGORIES } as T;
  }

  if (p === "courses/detail.php") {
    const slug = opts.query?.slug;
    const course = MOCK_COURSES.find((c) => c.slug === slug);
    if (!course) throw new ApiError("কোর্স পাওয়া যায়নি", 404);
    return {
      course,
      lessons: (course as any).lessons ?? [],
      enrolled: false,
    } as T;
  }

  if (p === "admin/settings.php" && opts.method === "GET") {
    return { settings: MOCK_SETTINGS } as T;
  }

  if (p === "auth/login.php" || p === "auth/register.php") {
    const email = opts.body?.email ?? "demo@nextscale.com";
    return {
      user: { id: 1, name: opts.body?.name ?? "Demo User", email, phone: "" },
      token: "mock-token-" + Date.now(),
    } as T;
  }

  if (p === "courses/my-courses.php") {
    return { courses: [MOCK_COURSES[0]] } as T;
  }

  if (p === "orders/my-orders.php") {
    return { orders: [] } as T;
  }

  if (p === "orders/create.php") {
    return { message: "অর্ডার সাবমিট হয়েছে (ডেমো)।", order_id: 999 } as any;
  }

  if (p === "content/trainers.php") {
    const slug = opts.query?.slug;
    if (slug) {
      const t = MOCK_TRAINERS.find((x) => x.slug === slug);
      if (!t) throw new ApiError("ট্রেনার পাওয়া যায়নি", 404);
      return { trainer: t, courses: MOCK_COURSES.filter((c) => c.instructor === t.name) } as T;
    }
    return { trainers: MOCK_TRAINERS } as T;
  }
  if (p === "content/testimonials.php") return { testimonials: MOCK_TESTIMONIALS } as T;
  if (p === "content/faqs.php") return { faqs: MOCK_FAQS } as T;
  if (p === "content/posts.php") {
    const slug = opts.query?.slug;
    if (slug) {
      const post = MOCK_POSTS.find((x) => x.slug === slug);
      if (!post) throw new ApiError("আর্টিকেল পাওয়া যায়নি", 404);
      return { post } as T;
    }
    return { posts: MOCK_POSTS } as T;
  }

  throw new ApiError("ডেমো মোডে এই endpoint সাপোর্ট করে না।", 404);
}
