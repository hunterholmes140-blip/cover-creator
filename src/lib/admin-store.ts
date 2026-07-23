// Generic localStorage-backed collections with React hooks.
// এই স্টোরটাই এডমিন প্যানেল এবং পাবলিক পেজের মধ্যে ব্রিজ।
// PHP API যুক্ত হলে এখান থেকে fetch/axios call-এ সুইচ করা যাবে — শেপ একই থাকবে।

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  MOCK_COURSES,
  MOCK_CATEGORIES,
  MOCK_TRAINERS,
  MOCK_POSTS,
  MOCK_HERO_VIDEOS,
  MOCK_VIDEO_GALLERY,
  MOCK_TESTIMONIALS,
  MOCK_FAQS,
} from "./mock-data";

type Listener = () => void;

// ---- Remote sync (uses generic content KV: /api/content.php + /api/admin/content.php) ----
function detectLive(): boolean {
  const envUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? "";
  if (envUrl) return true;
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return !(h.includes("lovableproject.com") || h.startsWith("id-preview--"));
}
const USE_REMOTE = detectLive();
const API_URL =
  ((import.meta.env.VITE_API_URL as string | undefined) ?? "").replace(/\/$/, "") ||
  (USE_REMOTE ? "/api" : "");

async function fetchRemoteList(key: string): Promise<any[] | undefined> {
  try {
    const res = await fetch(`${API_URL}/content.php?key=${encodeURIComponent(key)}`);
    if (!res.ok) return undefined;
    const json = await res.json();
    const v = json?.data?.value ?? json?.value;
    return Array.isArray(v) ? v : undefined;
  } catch {
    return undefined;
  }
}

async function saveRemoteList(key: string, value: any[]) {
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

class Collection<T extends { id: any }> {
  private items: T[];
  private listeners = new Set<Listener>();
  private saveTimer: any = null;
  private remoteKey: string;
  constructor(private key: string, private seed: T[], remoteKey?: string) {
    this.remoteKey = remoteKey ?? key;
    this.items = this.load();
    if (USE_REMOTE && typeof window !== "undefined") {
      // Hydrate from server once — same remote key as public content endpoints.
      fetchRemoteList(this.remoteKey).then((v) => {
        if (v && Array.isArray(v)) {
          this.items = v as T[];
          try { window.localStorage.setItem(this.key, JSON.stringify(this.items)); } catch {}
          this.listeners.forEach((l) => l());
        }
      });
    }
  }

  private load(): T[] {
    if (typeof window === "undefined") return this.seed;
    try {
      const raw = window.localStorage.getItem(this.key);
      if (raw) return JSON.parse(raw);
    } catch {}
    return JSON.parse(JSON.stringify(this.seed));
  }
  private persist() {
    try {
      window.localStorage.setItem(this.key, JSON.stringify(this.items));
    } catch {}
    this.listeners.forEach((l) => l());
    if (USE_REMOTE) {
      // Debounce so rapid inline edits become one network write.
      if (this.saveTimer) clearTimeout(this.saveTimer);
      const snapshot = this.items;
      this.saveTimer = setTimeout(() => saveRemoteList(this.remoteKey, snapshot), 400);
    }
  }

  getAll() {
    return this.items;
  }
  get(id: any) {
    return this.items.find((i) => String(i.id) === String(id));
  }
  getBy(pred: (i: T) => boolean) {
    return this.items.find(pred);
  }
  add(item: Partial<T>) {
    const id = (item as any).id ?? Date.now();
    const full = { ...(item as any), id } as T;
    this.items = [full, ...this.items];
    this.persist();
    return full;
  }
  update(id: any, patch: Partial<T>) {
    this.items = this.items.map((i) =>
      String(i.id) === String(id) ? { ...i, ...patch } : i,
    );
    this.persist();
  }
  updateBy(pred: (i: T) => boolean, patch: Partial<T>) {
    this.items = this.items.map((i) => (pred(i) ? { ...i, ...patch } : i));
    this.persist();
  }
  remove(id: any) {
    this.items = this.items.filter((i) => String(i.id) !== String(id));
    this.persist();
  }
  replaceAll(next: T[]) {
    this.items = next;
    this.persist();
  }
  reset() {
    this.items = JSON.parse(JSON.stringify(this.seed));
    this.persist();
  }
  /** Force an immediate remote save (for explicit "Save" buttons). */
  async saveNow() {
    if (!USE_REMOTE) return;
    if (this.saveTimer) { clearTimeout(this.saveTimer); this.saveTimer = null; }
    await saveRemoteList(this.remoteKey, this.items);
  }

  subscribe(l: Listener) {
    this.listeners.add(l);
    return () => {
      this.listeners.delete(l);
    };
  }
}

function useCollection<T extends { id: any }>(c: Collection<T>) {
  const items = useSyncExternalStore(
    (l) => c.subscribe(l),
    () => c.getAll(),
    () => c.getAll(),
  );
  return {
    items,
    get: (id: any) => items.find((i) => String(i.id) === String(id)),
    add: (i: Partial<T>) => c.add(i),
    update: (id: any, p: Partial<T>) => c.update(id, p),
    remove: (id: any) => c.remove(id),
    replaceAll: (next: T[]) => c.replaceAll(next),
    reset: () => c.reset(),
    saveNow: () => c.saveNow(),
  };
}

// -------- Collections --------
// NOTE: third arg = remoteKey — must match public content endpoints so admin
// changes reflect on the site instantly.
export const coursesStore = new Collection<any>("ns.courses.v1", MOCK_COURSES as any, "courses");
export const categoriesStore = new Collection<any>("ns.categories.v1", MOCK_CATEGORIES as any, "categories");
export const trainersStore = new Collection<any>("ns.trainers.v1", MOCK_TRAINERS as any, "trainers");
export const blogStore = new Collection<any>("ns.blog.v1", MOCK_POSTS as any, "posts");
export const heroStore = new Collection<any>("ns.hero.v1", MOCK_HERO_VIDEOS as any, "hero");
export const videosStore = new Collection<any>("ns.videos.v1", MOCK_VIDEO_GALLERY as any, "videos");
export const testimonialsStore = new Collection<any>("ns.testimonials.v1", MOCK_TESTIMONIALS as any, "testimonials");
export const faqsStore = new Collection<any>(
  "ns.faqs.v1",
  (MOCK_FAQS as any).map((f: any, i: number) => ({ id: i + 1, ...f })),
  "faqs",
);

export const ordersStore = new Collection<any>("ns.orders.v1", [
  {
    id: 1001,
    user_name: "মেহেদী হাসান",
    user_email: "mehedi@example.com",
    user_phone: "01700000001",
    course_title: "সম্পূর্ণ ওয়েব ডেভেলপমেন্ট বুটক্যাম্প",
    course_slug: "complete-web-development",
    amount: 3500,
    payment_method: "bKash",
    transaction_id: "TXN9K2LP",
    status: "pending",
    created_at: "২৩ জুলাই, ২০২৬",
  },
  {
    id: 1002,
    user_name: "নুসরাত জাহান",
    user_email: "nusrat@example.com",
    user_phone: "01700000002",
    course_title: "প্রফেশনাল গ্রাফিক ডিজাইন মাস্টারক্লাস",
    course_slug: "graphic-design-masterclass",
    amount: 2999,
    payment_method: "Nagad",
    transaction_id: "NGD-88KL2",
    status: "approved",
    created_at: "২২ জুলাই, ২০২৬",
  },
]);
export const usersStore = new Collection<any>("ns.users.v1", [
  { id: 1, name: "মেহেদী হাসান", email: "mehedi@example.com", phone: "01700000001", course_count: 1, created_at: "২০ জুলাই, ২০২৬" },
  { id: 2, name: "নুসরাত জাহান", email: "nusrat@example.com", phone: "01700000002", course_count: 1, created_at: "১৮ জুলাই, ২০২৬" },
  { id: 3, name: "সাব্বির রহমান", email: "sabbir@example.com", phone: "01700000003", course_count: 2, created_at: "১৫ জুলাই, ২০২৬" },
]);
export const pagesStore = new Collection<any>("ns.pages.v1", [
  { id: "about", slug: "about", title: "আমাদের সম্পর্কে", content: "NextScale Academy বাংলাদেশের অন্যতম আধুনিক অনলাইন লার্নিং প্ল্যাটফর্ম।" },
  { id: "privacy-policy", slug: "privacy-policy", title: "প্রাইভেসি পলিসি", content: "আপনার ব্যক্তিগত তথ্য আমাদের কাছে সম্পূর্ণ নিরাপদ।" },
  { id: "terms", slug: "terms", title: "শর্তাবলি", content: "সাইট ব্যবহারের নিয়ম ও শর্তাবলি।" },
  { id: "refund-policy", slug: "refund-policy", title: "রিফান্ড পলিসি", content: "কোর্স শুরুর ৭ দিনের মধ্যে ২৫% এর কম দেখলে সম্পূর্ণ রিফান্ড।" },
  { id: "affiliate", slug: "affiliate", title: "অ্যাফিলিয়েট প্রোগ্রাম", content: "আমাদের কোর্স রেফার করে আয় করুন।" },
  { id: "free-courses", slug: "free-courses", title: "ফ্রি কোর্স", content: "আমাদের ফ্রি রিসোর্স ও কোর্সগুলো এখানে।" },
]);
export const paymentsStore = new Collection<any>("ns.payments.v1", [
  { id: "bkash", label: "bKash", type: "মোবাইল ব্যাংকিং", number: "01700-000000", instructions: "Send Money করে transaction ID দিন।", enabled: 1 },
  { id: "nagad", label: "Nagad", type: "মোবাইল ব্যাংকিং", number: "01700-000000", instructions: "Send Money করে transaction ID দিন।", enabled: 1 },
  { id: "rocket", label: "Rocket", type: "মোবাইল ব্যাংকিং", number: "01700-0000000", instructions: "Send Money করে transaction ID দিন।", enabled: 1 },
]);

// -------- Hooks --------
export const useCourses = () => useCollection(coursesStore);
export const useCategories = () => useCollection(categoriesStore);
export const useTrainers = () => useCollection(trainersStore);
export const useBlog = () => useCollection(blogStore);
export const useHero = () => useCollection(heroStore);
export const useVideos = () => useCollection(videosStore);
export const useTestimonials = () => useCollection(testimonialsStore);
export const useFaqs = () => useCollection(faqsStore);
export const useOrders = () => useCollection(ordersStore);
export const useUsers = () => useCollection(usersStore);
export const usePages = () => useCollection(pagesStore);
export const usePayments = () => useCollection(paymentsStore);

// -------- Helpers --------
export function makeSlug(s: string) {
  return (
    (s || "")
      .toLowerCase()
      .trim()
      .replace(/[^\w\u0980-\u09FF\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") || `item-${Date.now()}`
  );
}

// SSR-safe forced re-render on mount (for hooks that read localStorage lazily).
export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}
