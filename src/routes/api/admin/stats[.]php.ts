import { createFileRoute } from "@tanstack/react-router";
import { qOne } from "@/lib/db.server";
import { handle, ok, requireAdmin } from "@/lib/auth.server";

export const Route = createFileRoute("/api/admin/stats.php")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          const users = await qOne<any>(`SELECT COUNT(*) AS c FROM users`);
          const orders = await qOne<any>(`SELECT COUNT(*) AS c FROM orders`);
          const courses = await qOne<any>(`SELECT COUNT(*) AS c FROM courses`);
          const revenue = await qOne<any>(
            `SELECT COALESCE(SUM(amount),0) AS s FROM orders WHERE status = 'approved'`,
          );
          const pending = await qOne<any>(`SELECT COUNT(*) AS c FROM orders WHERE status = 'pending'`);
          return ok({
            stats: {
              users: users?.c ?? 0,
              orders: orders?.c ?? 0,
              courses: courses?.c ?? 0,
              revenue: Number(revenue?.s ?? 0),
              pending_orders: pending?.c ?? 0,
            },
          });
        }),
    },
  },
});
