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
            `SELECT o.*, 
                    COALESCE(u.name, 'ইউজার (Student)') AS user_name, 
                    COALESCE(u.email, 'N/A') AS user_email, 
                    COALESCE(u.phone, 'N/A') AS user_phone, 
                    COALESCE(c.title, 'কোর্স (Course)') AS course_title
             FROM orders o
             LEFT JOIN users u ON u.id = o.user_id
             LEFT JOIN courses c ON c.id = o.course_id
             ORDER BY o.created_at DESC`,
          );
          return ok({ orders });
        }),

      PUT: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          const b = await request.json().catch(() => ({}));
          const id = Number(b.id);
          const status = ["pending", "approved", "rejected", "failed"].includes(b.status) ? b.status : null;
          if (!id || !status) return fail(400, "id ও status প্রয়োজন");

          await exec(`UPDATE orders SET status = ? WHERE id = ?`, [status, id]);

          if (status === "approved") {
            const order = await qOne<any>(
              `SELECT o.id, o.user_id, o.course_id, o.amount, o.transaction_id, u.name AS user_name, u.email AS user_email, c.title AS course_title
               FROM orders o
               LEFT JOIN users u ON u.id = o.user_id
               LEFT JOIN courses c ON c.id = o.course_id
               WHERE o.id = ?`,
              [id]
            );
            if (order) {
              await exec(
                `INSERT IGNORE INTO enrollments (user_id, course_id, order_id) VALUES (?, ?, ?)`,
                [order.user_id, order.course_id, id],
              ).catch(() => {});
              const { sendTemplatedEmail } = await import("@/lib/email.server");
              sendTemplatedEmail("payment_success", order.user_email, {
                user_name: order.user_name || "Student",
                user_email: order.user_email,
                course_title: order.course_title,
                amount: order.amount,
                transaction_id: order.transaction_id || `ORD-${id}`,
                dashboard_url: "https://vencon.com.bd/dashboard",
              }).catch(() => {});
            }
          } else if (status === "rejected" || status === "failed") {
            const order = await qOne<any>(
              `SELECT o.id, o.amount, o.transaction_id, u.name AS user_name, u.email AS user_email, c.title AS course_title
               FROM orders o
               LEFT JOIN users u ON u.id = o.user_id
               LEFT JOIN courses c ON c.id = o.course_id
               WHERE o.id = ?`,
              [id]
            );
            if (order) {
              const { sendTemplatedEmail } = await import("@/lib/email.server");
              sendTemplatedEmail("payment_failed", order.user_email, {
                user_name: order.user_name || "Student",
                user_email: order.user_email,
                course_title: order.course_title,
                amount: order.amount,
                transaction_id: order.transaction_id || `ORD-${id}`,
                dashboard_url: "https://vencon.com.bd/courses",
              }).catch(() => {});
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
