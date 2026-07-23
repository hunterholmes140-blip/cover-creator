import { createFileRoute } from "@tanstack/react-router";
import { q } from "@/lib/db.server";
import { handle, ok, requireUser } from "@/lib/auth.server";

export const Route = createFileRoute("/api/courses/my-courses[.]php")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        handle(async () => {
          const u = requireUser(request);
          const courses = await q(
            `SELECT c.*, cat.slug AS category_slug, cat.name AS category_name, e.enrolled_at
             FROM enrollments e
             JOIN courses c ON c.id = e.course_id
             LEFT JOIN categories cat ON cat.id = c.category_id
             WHERE e.user_id = ? ORDER BY e.enrolled_at DESC`,
            [u.id],
          );
          return ok({ courses });
        }),
    },
  },
});
