import { createFileRoute } from "@tanstack/react-router";
import { qOne, exec } from "@/lib/db.server";
import { handle, ok, fail, bearerFrom, hashPassword } from "@/lib/auth.server";

export const Route = createFileRoute("/api/orders/create.php")({
  server: {
    handlers: {
      POST: async ({ request }) =>
        handle(async () => {
          const body = await request.json().catch(() => ({}));
          let user = bearerFrom(request);

          if (!user) {
            const email = String(body.email || "").trim().toLowerCase();
            const name = String(body.name || "").trim() || "Student";
            const phone = String(body.phone || body.sender_number || "").trim() || null;
            const password = String(body.password || "").trim();

            if (email) {
              const existing = await qOne<any>(`SELECT id, name, email, phone FROM users WHERE email = ? LIMIT 1`, [email]);
              if (existing) {
                user = existing;
              } else {
                const defaultPw = password && password.length >= 6 ? password : (phone && phone.length >= 6 ? phone.slice(-6) : "123456");
                const hash = await hashPassword(defaultPw);
                const res = await exec(
                  `INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)`,
                  [name, email, phone, hash]
                );
                user = { id: res.insertId, name, email, phone };
              }
            }
          }

          if (!user) {
            return fail(401, "অর্ডার করতে আপনার নাম ও ইমেইল ফিল্ড পূরণ করুন।");
          }
          const course_id = Number(body.course_id);
          const payment_method = ["bkash", "nagad", "rocket", "manual"].includes(body.payment_method)
            ? body.payment_method
            : "bkash";
          const sender_number = String(body.sender_number || "").trim() || null;
          const transaction_id = String(body.transaction_id || "").trim() || null;
          const note = String(body.note || "").trim() || null;
          if (!course_id) return fail(400, "কোর্স সিলেক্ট করুন");

          const course = await qOne<any>(
            `SELECT id, price, discount_price FROM courses WHERE id = ? AND is_published = 1`,
            [course_id],
          );
          if (!course) return fail(404, "কোর্স পাওয়া যায়নি");
          const amount = course.discount_price ?? course.price;

          const res = await exec(
            `INSERT INTO orders (user_id, course_id, amount, payment_method, sender_number, transaction_id, note)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [user.id, course_id, amount, payment_method, sender_number, transaction_id, note],
          );
          return ok({ message: "অর্ডার সাবমিট হয়েছে। এডমিন যাচাই করে এনরোল করবেন।", order_id: res.insertId });
        }),
    },
  },
});
