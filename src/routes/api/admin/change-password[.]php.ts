import { createFileRoute } from "@tanstack/react-router";
import { qOne, exec } from "@/lib/db.server";
import { handle, ok, fail, requireAdmin, verifyPassword, hashPassword } from "@/lib/auth.server";

export const Route = createFileRoute("/api/admin/change-password.php")({
  server: {
    handlers: {
      POST: async ({ request }) =>
        handle(async () => {
          const user = requireAdmin(request);
          const body = await request.json().catch(() => ({}));
          const currentPassword = String(body.current_password || "");
          const newPassword = String(body.new_password || "");
          const newEmail = String(body.new_email || "").trim();

          if (!currentPassword) {
            return fail(400, "বর্তমান পাসওয়ার্ড প্রদান করুন।");
          }

          if (!newPassword && !newEmail) {
            return fail(400, "নতুন ইমেইল বা পাসওয়ার্ড প্রদান করুন।");
          }

          if (newPassword && newPassword.length < 6) {
            return fail(400, "নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
          }

          const dbUser = await qOne<any>(`SELECT id, email, password FROM users WHERE id = ? LIMIT 1`, [user.id]);
          if (!dbUser) return fail(404, "ইউজার পাওয়া যায়নি।");

          const isMatch = await verifyPassword(currentPassword, dbUser.password);
          if (!isMatch) {
            return fail(400, "বর্তমান পাসওয়ার্ডটি সঠিক নয়।");
          }

          let updatedEmail = dbUser.email;
          if (newEmail && newEmail !== dbUser.email) {
            const existing = await qOne<any>(`SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1`, [newEmail, user.id]);
            if (existing) {
              return fail(400, "এই ইমেইলটি অন্য কোনো একাউন্টে ব্যবহৃত হচ্ছে।");
            }
            await exec(`UPDATE users SET email = ? WHERE id = ?`, [newEmail, user.id]);
            updatedEmail = newEmail;
          }

          if (newPassword) {
            const newHash = await hashPassword(newPassword);
            await exec(`UPDATE users SET password = ? WHERE id = ?`, [newHash, user.id]);
          }

          return ok({
            message: "এডমিন ইমেইল / পাসওয়ার্ড তথ্য সফলভাবে আপডেট করা হয়েছে 🔒",
            updatedEmail,
          });
        }),
    },
  },
});
