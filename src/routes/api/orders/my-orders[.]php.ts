import { createFileRoute } from "@tanstack/react-router";
import { q } from "@/lib/db.server";
import { handle, ok, requireUser } from "@/lib/auth.server";

export const Route = createFileRoute("/api/orders/my-orders[.]php")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        handle(async () => {
          const u = requireUser(request);
          const orders = await q(
            `SELECT o.*, c.title AS course_title, c.slug AS course_slug, c.thumbnail
             FROM orders o JOIN courses c ON c.id = o.course_id
             WHERE o.user_id = ? ORDER BY o.created_at DESC`,
            [u.id],
          );
          return ok({ orders });
        }),
    },
  },
});
