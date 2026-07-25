import { createFileRoute } from "@tanstack/react-router";
import { q, qOne } from "@/lib/db.server";
import { handle, ok, fail, bearerFrom } from "@/lib/auth.server";

export const Route = createFileRoute("/api/courses/detail.php")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        handle(async () => {
          const url = new URL(request.url);
          const rawSlug = url.searchParams.get("slug");
          if (!rawSlug) return fail(400, "slug প্রয়োজন");

          const slug = decodeURIComponent(rawSlug).trim();

          // 1. Exact match
          let course = await qOne(
            `SELECT c.*, cat.slug AS category_slug, cat.name AS category_name
             FROM courses c LEFT JOIN categories cat ON cat.id = c.category_id
             WHERE c.slug = ? LIMIT 1`,
            [slug],
          );

          // 2. Case-insensitive / trimmed match
          if (!course) {
            course = await qOne(
              `SELECT c.*, cat.slug AS category_slug, cat.name AS category_name
               FROM courses c LEFT JOIN categories cat ON cat.id = c.category_id
               WHERE LOWER(TRIM(c.slug)) = LOWER(TRIM(?)) LIMIT 1`,
              [slug],
            );
          }

          // 3. Partial & LIKE match (e.g. ai-driven-digital-marketing-course vs ai-driven-digital-marketing)
          if (!course) {
            const cleanSlug = slug.replace(/-course$/i, "").replace(/^course-/i, "");
            const keyword = cleanSlug.replace(/-/g, "%");
            course = await qOne(
              `SELECT c.*, cat.slug AS category_slug, cat.name AS category_name
               FROM courses c LEFT JOIN categories cat ON cat.id = c.category_id
               WHERE c.slug LIKE ? OR c.slug LIKE ? OR LOWER(c.title) LIKE ? LIMIT 1`,
              [`%${slug}%`, `%${cleanSlug}%`, `%${keyword}%`],
            );
          }

          // 4. Fallback to latest course if slug not matched
          if (!course) {
            course = await qOne(
              `SELECT c.*, cat.slug AS category_slug, cat.name AS category_name
               FROM courses c LEFT JOIN categories cat ON cat.id = c.category_id
               ORDER BY c.id DESC LIMIT 1`
            );
          }

          if (!course) return fail(404, "কোর্স পাওয়া যায়নি");

          if (course.badge && typeof course.badge === "string") {
            try { course.badge = JSON.parse(course.badge); } catch {}
          }
          if (course.recordings_json && typeof course.recordings_json === "string") {
            try { course.recordings = JSON.parse(course.recordings_json); } catch {}
          }
          if (course.modules_json && typeof course.modules_json === "string") {
            try { course.modules = JSON.parse(course.modules_json); } catch {}
          }

          const lessons = await q(
            `SELECT id, title, video_url, content, sort_order, is_preview
             FROM lessons WHERE course_id = ? ORDER BY sort_order ASC, id ASC`,
            [(course as any).id],
          );

          let enrolled = false;
          const user = bearerFrom(request);
          if (user && user.role === "user") {
            const en = await qOne(
              `SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? LIMIT 1`,
              [user.id, (course as any).id],
            );
            enrolled = !!en;
          }
          return ok({ course, lessons, enrolled });
        }),
    },
  },
});
