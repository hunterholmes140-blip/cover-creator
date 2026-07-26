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

          // Ensure users table and role column exist
          try {
            await exec(`
              CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL DEFAULT 'Admin',
                email VARCHAR(255) NOT NULL UNIQUE,
                phone VARCHAR(50) DEFAULT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'admin',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
          } catch (e) {}

          try {
            await exec(`ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'admin'`);
          } catch (e) {}

          // Lookup existing admin user
          let dbUser = await qOne<any>(`SELECT id, email, password FROM users WHERE role = 'admin' LIMIT 1`).catch(() => null);
          if (!dbUser) {
            dbUser = await qOne<any>(`SELECT id, email, password FROM users ORDER BY id ASC LIMIT 1`).catch(() => null);
          }

          const targetEmail = newEmail || dbUser?.email || "admin@nextscale.com";

          try {
            if (dbUser) {
              if (newPassword) {
                const newHash = await hashPassword(newPassword);
                await exec(`UPDATE users SET email = ?, password = ?, role = 'admin' WHERE id = ?`, [targetEmail, newHash, dbUser.id]);
                try { await exec(`UPDATE admins SET email = ?, password = ? WHERE email = ? OR id = ?`, [targetEmail, newHash, targetEmail, dbUser.id]); } catch {}
              } else {
                await exec(`UPDATE users SET email = ?, role = 'admin' WHERE id = ?`, [targetEmail, dbUser.id]);
                try { await exec(`UPDATE admins SET email = ? WHERE email = ? OR id = ?`, [targetEmail, targetEmail, dbUser.id]); } catch {}
              }
            } else {
              const targetPw = newPassword || "123456";
              const newHash = await hashPassword(targetPw);
              await exec(
                `INSERT INTO users (name, email, password, role) VALUES ('Super Admin', ?, ?, 'admin')`,
                [targetEmail, newHash]
              );
              try {
                await exec(
                  `INSERT INTO admins (id, name, email, password) VALUES (1, 'Super Admin', ?, ?) ON DUPLICATE KEY UPDATE email = VALUES(email), password = VALUES(password)`,
                  [targetEmail, newHash]
                );
              } catch {}
            }
          } catch (err: any) {
            if (newPassword) {
              const newHash = await hashPassword(newPassword);
              await exec(`UPDATE users SET password = ?, role = 'admin' WHERE email = ?`, [newHash, targetEmail]);
              try { await exec(`UPDATE admins SET password = ? WHERE email = ?`, [newHash, targetEmail]); } catch {}
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
