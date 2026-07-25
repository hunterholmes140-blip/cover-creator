import { Link } from "@tanstack/react-router";
import { Clock, User } from "lucide-react";
import { useEffect, useState } from "react";
import { taka } from "@/lib/format";
import { resolveBadge, BADGE_STYLES, type CourseBadge } from "@/lib/course-badges";

export function CourseCard({ course }: { course: any }) {
  let price = Number(course.price || 0);
  let originalPrice: number | null = null;
  const disc = course.discount_price !== null && course.discount_price !== undefined ? Number(course.discount_price) : null;

  if (disc !== null && disc > 0 && disc !== price) {
    if (disc < price) {
      price = disc;
      originalPrice = Number(course.price);
    } else {
      originalPrice = disc;
    }
  }

  const hasDiscount = originalPrice !== null && originalPrice > price;

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
            <span className="text-2xl sm:text-4xl font-bold text-primary/40">{course.title.charAt(0)}</span>
          </div>
        )}
        {course.category_name && (
          <span className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 rounded-full bg-background/90 backdrop-blur px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-medium max-w-[85%] truncate">
            {course.category_name}
          </span>
        )}
      </div>
      {badge && style && (
        <div
          className={`absolute -top-2 -right-1 sm:-top-3 sm:-right-2 z-10 h-10 w-10 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br ${style.gradient} ring-2 sm:ring-4 ${style.ring} shadow-xl ${style.glow} flex flex-col items-center justify-center text-white text-center rotate-[-8deg] group-hover:rotate-0 transition-transform`}
          style={{ fontFamily: '"Hind Siliguri", sans-serif' }}
        >
          <span className="text-xs sm:text-base leading-none">{style.icon}</span>
          <span className="text-[7px] sm:text-[10px] font-bold leading-tight mt-0.5 px-0.5 line-clamp-1 sm:line-clamp-2">{badge.text}</span>
        </div>
      )}

      <div className="p-2.5 sm:p-4">
        <h3 className="font-semibold text-xs sm:text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        {course.short_description && (
          <p className="mt-1 sm:mt-2 text-[11px] sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-2">
            {course.short_description}
          </p>
        )}
        <div className="mt-1.5 sm:mt-3 flex flex-wrap items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground">
          {course.instructor && (
            <span className="inline-flex items-center gap-0.5 sm:gap-1 truncate"><User className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> {course.instructor}</span>
          )}
          {course.duration && (
            <span className="inline-flex items-center gap-0.5 sm:gap-1"><Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> {course.duration}</span>
          )}
        </div>
        <div className="mt-2 sm:mt-4 flex items-center justify-between">
          <div className="flex items-baseline gap-1 sm:gap-2">
            <span className="text-xs sm:text-lg font-bold text-primary">{taka(price)}</span>
            {hasDiscount && originalPrice && (
              <span className="text-[10px] sm:text-sm text-muted-foreground line-through font-normal">{taka(originalPrice)}</span>
            )}
          </div>
          <span className="text-[10px] sm:text-xs font-medium text-primary group-hover:translate-x-1 transition-transform hidden sm:inline">
            বিস্তারিত →
          </span>
        </div>
      </div>
    </Link>
  );
}
