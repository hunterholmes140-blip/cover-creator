import { createFileRoute } from "@tanstack/react-router";
import { q, exec } from "@/lib/db.server";
import { handle, ok, requireAdmin, fail } from "@/lib/auth.server";

export const Route = createFileRoute("/api/admin/users[.]php")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          const users = await q(
            `SELECT u.id, u.name, u.email, u.phone, u.created_at,
                    (SELECT COUNT(*) FROM enrollments e WHERE e.user_id = u.id) AS enrolled_count
             FROM users u ORDER BY u.created_at DESC`,
          );
          return ok({ users });
        }),

      DELETE: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          const url = new URL(request.url);
          const id = Number(url.searchParams.get("id"));
          if (!id) return fail(400, "id প্রয়োজন");
          await exec(`DELETE FROM users WHERE id = ?`, [id]);
          return ok({ id });
        }),
    },
  },
});
