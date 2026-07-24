import { Link } from "@tanstack/react-router";
import { Clock, User } from "lucide-react";
import { useEffect, useState } from "react";
import { taka } from "@/lib/format";
import { resolveBadge, BADGE_STYLES, type CourseBadge } from "@/lib/course-badges";

export function CourseCard({ course }: { course: any }) {
  const price = course.discount_price ?? course.price;
  const hasDiscount = course.discount_price && course.discount_price < course.price;

  const [badge, setBadge] = useState<CourseBadge | null>(() => resolveBadge(course));
  useEffect(() => {
    const update = () => setBadge(resolveBadge(course));
    update();
    window.addEventListener("course-badges-changed", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("course-badges-changed", update);
      window.removeEventListener("storage", update);
    };
  }, [course]);

  const style = badge ? BADGE_STYLES[badge.variant] : null;

  return (
    <Link
      to="/courses/$slug"
      params={{ slug: course.slug }}
      className="group relative block rounded-xl border border-border bg-card overflow-visible hover:shadow-lg hover:border-primary/40 transition-all"
    >
      <div className="aspect-video bg-gradient-to-br from-primary/20 via-primary/10 to-accent relative overflow-hidden rounded-t-xl">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full grid place-items-center">
            <span className="text-4xl font-bold text-primary/40">{course.title.charAt(0)}</span>
          </div>
        )}
        {course.category_name && (
          <span className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur px-2.5 py-1 text-xs font-medium">
            {course.category_name}
          </span>
        )}
      </div>
      {badge && style && (
        <div
          className={`absolute -top-2 -right-1 sm:-top-3 sm:-right-2 z-10 h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br ${style.gradient} ring-2 sm:ring-4 ${style.ring} shadow-xl ${style.glow} flex flex-col items-center justify-center text-white text-center rotate-[-8deg] group-hover:rotate-0 transition-transform`}
          style={{ fontFamily: '"Hind Siliguri", sans-serif' }}
        >
          <span className="text-base leading-none">{style.icon}</span>
          <span className="text-[10px] font-bold leading-tight mt-0.5 px-1 line-clamp-2">{badge.text}</span>
        </div>
      )}

      <div className="p-4">
        <h3 className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        {course.short_description && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{course.short_description}</p>
        )}
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          {course.instructor && (
            <span className="inline-flex items-center gap-1"><User className="h-3 w-3" /> {course.instructor}</span>
          )}
          {course.duration && (
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {course.duration}</span>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">{taka(price)}</span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">{taka(course.price)}</span>
            )}
          </div>
          <span className="text-xs font-medium text-primary group-hover:translate-x-1 transition-transform">
            বিস্তারিত →
          </span>
        </div>
      </div>
    </Link>
  );
}
