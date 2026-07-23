import { createFileRoute } from "@tanstack/react-router";
import { q } from "@/lib/db.server";
import { handle, ok } from "@/lib/auth.server";

export const Route = createFileRoute("/api/courses/list[.]php")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        handle(async () => {
          const url = new URL(request.url);
          const featured = url.searchParams.get("featured");
          const category = url.searchParams.get("category");
          const search = url.searchParams.get("search");

          const where: string[] = ["c.is_published = 1"];
          const params: any[] = [];
          if (featured) where.push("c.is_featured = 1");
          if (category) {
            where.push("cat.slug = ?");
            params.push(category);
          }
          if (search) {
            where.push("c.title LIKE ?");
            params.push(`%${search}%`);
          }

          const courses = await q(
            `SELECT c.*, cat.slug AS category_slug, cat.name AS category_name
             FROM courses c
             LEFT JOIN categories cat ON cat.id = c.category_id
             WHERE ${where.join(" AND ")}
             ORDER BY c.created_at DESC`,
            params,
          );
          return ok({ courses });
        }),
    },
  },
});
