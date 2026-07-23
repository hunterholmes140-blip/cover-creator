import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MOCK_COURSES } from "@/lib/mock-data";
import {
  BADGE_PRESETS,
  BADGE_STYLES,
  getAllBadges,
  resolveBadge,
  setBadgeOverride,
  type BadgeVariant,
  type CourseBadge,
} from "@/lib/course-badges";

export const Route = createFileRoute("/admin/courses")({
  component: AdminCourses,
});

function AdminCourses() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const rerender = () => setTick((t) => t + 1);
    window.addEventListener("course-badges-changed", rerender);
    return () => window.removeEventListener("course-badges-changed", rerender);
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">কোর্স ম্যানেজমেন্ট</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          প্রতিটি কোর্সে একটি ব্যাজ (যেমন: নতুন, হট, বেস্টসেলার) অ্যাসাইন করুন। ব্যাজ সাথে সাথে কোর্স কার্ডে দেখা যাবে।
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {MOCK_COURSES.map((c) => (
          <CourseRow key={c.id} course={c} />
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        নোট: ডেমো মোডে ব্যাজ ব্রাউজারের localStorage-এ সেভ হচ্ছে। PHP API যুক্ত হলে সরাসরি ডাটাবেসে সেভ হবে।
      </p>
    </div>
  );
}

function CourseRow({ course }: { course: any }) {
  const current = resolveBadge(course);
  const [text, setText] = useState(current?.text ?? "");
  const [variant, setVariant] = useState<BadgeVariant>(current?.variant ?? "new");

  useEffect(() => {
    const c = resolveBadge(course);
    setText(c?.text ?? "");
    if (c?.variant) setVariant(c.variant);
  }, [course, getAllBadges()[course.slug]]);

  const save = (b: CourseBadge | null) => setBadgeOverride(course.slug, b);
  const style = BADGE_STYLES[variant];

  return (
    <div className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
      <div className="flex items-center gap-3 md:w-64 shrink-0">
        {course.thumbnail && (
          <img src={course.thumbnail} alt="" className="h-12 w-16 rounded-md object-cover" />
        )}
        <div>
          <div className="font-medium text-sm line-clamp-1">{course.title}</div>
          <div className="text-xs text-muted-foreground">{course.category_name}</div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={variant}
            onChange={(e) => setVariant(e.target.value as BadgeVariant)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            {BADGE_PRESETS.map((p) => (
              <option key={p.variant} value={p.variant}>{p.text}</option>
            ))}
          </select>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={BADGE_PRESETS.find((p) => p.variant === variant)?.text}
            className="h-9 flex-1 min-w-[140px] rounded-md border border-input bg-background px-3 text-sm"
          />
          <span
            className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${style.gradient} px-3 py-1 text-xs font-bold text-white shadow ${style.glow}`}
            style={{ fontFamily: '"Hind Siliguri", sans-serif' }}
          >
            <span>{style.icon}</span>
            <span>{text || BADGE_PRESETS.find((p) => p.variant === variant)?.text}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => save({ text: text || BADGE_PRESETS.find((p) => p.variant === variant)!.text, variant })}
            className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            সেভ
          </button>
          <button
            onClick={() => save(null)}
            className="h-9 rounded-md border border-border px-3 text-sm hover:bg-muted"
          >
            মুছুন
          </button>
        </div>
      </div>
    </div>
  );
}
