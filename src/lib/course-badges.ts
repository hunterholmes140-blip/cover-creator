// কোর্স ব্যাজ — এডমিন প্যানেল থেকে নির্দিষ্ট কোর্সে ব্যাজ যোগ/সম্পাদনা
// ব্যাকএন্ড (PHP) ready হওয়ার আগ পর্যন্ত localStorage-এ override রাখা হয়।

export type BadgeVariant =
  | "new"
  | "hot"
  | "bestseller"
  | "limited"
  | "sale"
  | "premium";

export type CourseBadge = {
  text: string;
  variant: BadgeVariant;
};

export const BADGE_PRESETS: { variant: BadgeVariant; text: string }[] = [
  { variant: "new", text: "নতুন" },
  { variant: "hot", text: "হট" },
  { variant: "bestseller", text: "বেস্টসেলার" },
  { variant: "limited", text: "সীমিত সময়" },
  { variant: "sale", text: "অফার" },
  { variant: "premium", text: "প্রিমিয়াম" },
];

const STORAGE_KEY = "course_badges_v1";

type BadgeMap = Record<string, CourseBadge | null>;

function read(): BadgeMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function write(map: BadgeMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  window.dispatchEvent(new Event("course-badges-changed"));
}

export function getBadgeOverride(slug: string): CourseBadge | null | undefined {
  return read()[slug];
}

export function setBadgeOverride(slug: string, badge: CourseBadge | null) {
  const map = read();
  map[slug] = badge;
  write(map);
}

export function getAllBadges(): BadgeMap {
  return read();
}

/**
 * ব্যাকএন্ড থেকে আসা কোর্স অবজেক্টের সাথে localStorage override merge করে
 * একটি effective badge রিটার্ন করে (override থাকলে override, না থাকলে কোর্সের নিজস্ব)।
 */
export function resolveBadge(course: any): CourseBadge | null {
  if (!course) return null;
  const override = getBadgeOverride(course.slug);
  if (override !== undefined) return override; // null = ব্যাজ মুছে ফেলা হয়েছে
  if (course.badge && course.badge.text) return course.badge as CourseBadge;
  return null;
}

export const BADGE_STYLES: Record<BadgeVariant, { gradient: string; ring: string; glow: string; icon: string }> = {
  new: {
    gradient: "from-emerald-500 to-teal-500",
    ring: "ring-emerald-300/60",
    glow: "shadow-emerald-500/40",
    icon: "✨",
  },
  hot: {
    gradient: "from-rose-500 via-red-500 to-orange-500",
    ring: "ring-rose-300/60",
    glow: "shadow-rose-500/40",
    icon: "🔥",
  },
  bestseller: {
    gradient: "from-amber-500 to-orange-600",
    ring: "ring-amber-300/60",
    glow: "shadow-amber-500/40",
    icon: "🏆",
  },
  limited: {
    gradient: "from-fuchsia-500 to-purple-600",
    ring: "ring-fuchsia-300/60",
    glow: "shadow-fuchsia-500/40",
    icon: "⏳",
  },
  sale: {
    gradient: "from-sky-500 to-blue-600",
    ring: "ring-sky-300/60",
    glow: "shadow-sky-500/40",
    icon: "%",
  },
  premium: {
    gradient: "from-yellow-400 via-amber-500 to-orange-500",
    ring: "ring-yellow-300/60",
    glow: "shadow-amber-500/40",
    icon: "👑",
  },
};
