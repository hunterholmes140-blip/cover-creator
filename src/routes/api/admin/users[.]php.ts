import { createFileRoute } from "@tanstack/react-router";
import { q, exec } from "@/lib/db.server";
import { handle, ok, requireAdmin, fail } from "@/lib/auth.server";

export const Route = createFileRoute("/api/admin/users.php")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          try {
            await exec(`ALTER TABLE users ADD COLUMN note TEXT DEFAULT NULL`).catch(() => {});
          } catch {}
          try {
            await exec(`
              CREATE TABLE IF NOT EXISTS enrollments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                course_id INT NOT NULL,
                order_id INT DEFAULT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY user_course (user_id, course_id)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `).catch(() => {});
          } catch {}

          const users = await q(
            `SELECT u.id, u.name, u.email, u.phone, u.note, u.created_at,
                    (SELECT COUNT(*) FROM enrollments e WHERE e.user_id = u.id) AS enrolled_count
             FROM users u ORDER BY u.created_at DESC`,
          );
          return ok({ users });
        }),

      POST: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          const body = await request.json().catch(() => ({}));
          const user_id = Number(body.user_id);
          const course_id = Number(body.course_id);
          const action = String(body.action || "list"); // "list" | "enroll" | "unenroll"

          if (!user_id) return fail(400, "user_id প্রয়োজন");

          try {
            await exec(`
              CREATE TABLE IF NOT EXISTS enrollments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                course_id INT NOT NULL,
                order_id INT DEFAULT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY user_course (user_id, course_id)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `).catch(() => {});
          } catch {}

          if (action === "list") {
            let enrollments: any[] = [];
            try {
              enrollments = await q(
                `SELECT e.course_id, c.title AS course_title, e.created_at
                 FROM enrollments e
                 JOIN courses c ON c.id = e.course_id
                 WHERE e.user_id = ?`,
                [user_id]
              );
            } catch (err) {
              console.error("[Users Admin Enrollments query error]:", err);
            }

            let allCourses: any[] = [];
            try {
              allCourses = await q(`SELECT id, title, price, discount_price, is_published FROM courses ORDER BY id DESC`);
            } catch (err) {
              console.error("[Users Admin All Courses query error]:", err);
            }

            return ok({ user_id, enrollments, all_courses: allCourses });
          }

          if (!course_id) return fail(400, "course_id প্রয়োজন");

          if (action === "enroll") {
            await exec(
              `INSERT IGNORE INTO enrollments (user_id, course_id) VALUES (?, ?)`,
              [user_id, course_id]
            ).catch((e) => console.error("Enrollment insert error:", e));

            await exec(
              `INSERT INTO orders (user_id, course_id, amount, payment_method, note, status)
               VALUES (?, ?, 0, 'manual', 'Admin Manual Activation', 'approved')`,
              [user_id, course_id]
            ).catch(() => {});

            return ok({ user_id, course_id, enrolled: true, message: "কোর্স ম্যানুয়ালি এক্টিভ করা হয়েছে" });
          }

          if (action === "unenroll") {
            await exec(`DELETE FROM enrollments WHERE user_id = ? AND course_id = ?`, [user_id, course_id]).catch(() => {});
            return ok({ user_id, course_id, enrolled: false, message: "কোর্স এক্সেস সরিয়ে দেওয়া হয়েছে" });
          }

          return fail(400, "Invalid action");
        }),

      PUT: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          const body = await request.json().catch(() => ({}));
          const id = Number(body.id);
          const note = body.note !== undefined ? String(body.note) : null;
          if (!id) return fail(400, "id প্রয়োজন");

          try {
            await exec(`ALTER TABLE users ADD COLUMN note TEXT DEFAULT NULL`).catch(() => {});
            await exec(`UPDATE users SET note = ? WHERE id = ?`, [note, id]);
          } catch (err: any) {
            console.error("[Users Note] Update error:", err);
          }
          return ok({ id, note });
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
