import { createFileRoute } from "@tanstack/react-router";
import { q, qOne, exec } from "@/lib/db.server";
import { handle, ok, requireAdmin, fail } from "@/lib/auth.server";

export const Route = createFileRoute("/api/admin/orders.php")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          const orders = await q(
            `SELECT o.*, u.name AS user_name, u.email AS user_email, c.title AS course_title
             FROM orders o
             JOIN users u ON u.id = o.user_id
             JOIN courses c ON c.id = o.course_id
             ORDER BY o.created_at DESC`,
          );
          return ok({ orders });
        }),

      PUT: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          const b = await request.json().catch(() => ({}));
          const id = Number(b.id);
          const status = ["pending", "approved", "rejected"].includes(b.status) ? b.status : null;
          if (!id || !status) return fail(400, "id ও status প্রয়োজন");

          await exec(`UPDATE orders SET status = ? WHERE id = ?`, [status, id]);

          if (status === "approved") {
            const order = await qOne<any>(`SELECT user_id, course_id FROM orders WHERE id = ?`, [id]);
            if (order) {
              await exec(
                `INSERT IGNORE INTO enrollments (user_id, course_id, order_id) VALUES (?, ?, ?)`,
                [order.user_id, order.course_id, id],
              );
            }
          }
          return ok({ id, status });
        }),

      DELETE: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          const url = new URL(request.url);
          const id = Number(url.searchParams.get("id"));
          if (!id) return fail(400, "id প্রয়োজন");
          await exec(`DELETE FROM orders WHERE id = ?`, [id]);
          return ok({ id });
        }),
    },
  },
});
