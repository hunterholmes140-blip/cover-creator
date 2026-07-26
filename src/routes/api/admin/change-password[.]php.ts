import { createFileRoute } from "@tanstack/react-router";
import { qOne, exec } from "@/lib/db.server";
import { handle, ok, fail, requireAdmin, hashPassword } from "@/lib/auth.server";

export const Route = createFileRoute("/api/admin/change-password.php")({
  server: {
    handlers: {
      POST: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          const body = await request.json().catch(() => ({}));
          const newPassword = String(body.new_password || "");
          const newEmail = String(body.new_email || "").trim();

          if (!newPassword && !newEmail) {
            return fail(400, "নতুন ইমেইল বা পাসওয়ার্ড প্রদান করুন।");
          }

          if (newPassword && newPassword.length < 6) {
            return fail(400, "নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
          }

          // Ensure admins table exists
          try {
            await exec(`
              CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL DEFAULT 'Super Admin',
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                token VARCHAR(255) DEFAULT NULL,
                token_expires_at DATETIME DEFAULT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
          } catch (e) {}

          // Lookup existing admin in admins table
          let admin = await qOne<any>(`SELECT id, email FROM admins ORDER BY id ASC LIMIT 1`).catch(() => null);

          const targetEmail = newEmail || admin?.email || "admin@nextscale.com";

          try {
            if (admin) {
              if (newPassword) {
                const newHash = await hashPassword(newPassword);
                await exec(`UPDATE admins SET email = ?, password = ? WHERE id = ?`, [targetEmail, newHash, admin.id]);
              } else {
                await exec(`UPDATE admins SET email = ? WHERE id = ?`, [targetEmail, admin.id]);
              }
            } else {
              const targetPw = newPassword || "admin123";
              const newHash = await hashPassword(targetPw);
              await exec(
                `INSERT INTO admins (id, name, email, password) VALUES (1, 'Super Admin', ?, ?) ON DUPLICATE KEY UPDATE email = VALUES(email), password = VALUES(password)`,
                [targetEmail, newHash]
              );
            }
          } catch (err: any) {
            if (newPassword) {
              const newHash = await hashPassword(newPassword);
              await exec(`UPDATE admins SET password = ? WHERE email = ?`, [newHash, targetEmail]);
            }
          }

          return ok({
            message: "এডমিন ইমেইল ও পাসওয়ার্ড তথ্য সফলভাবে আপডেট করা হয়েছে 🔒",
            updatedEmail: targetEmail,
          });
        }),
    },
  },
});
