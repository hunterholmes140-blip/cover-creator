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

          if (!currentPassword || !newPassword) {
            return fail(400, "বর্তমান এবং নতুন পাসওয়ার্ড উভয়ই প্রদান করুন।");
          }

          if (newPassword.length < 6) {
            return fail(400, "নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
          }

          const dbUser = await qOne<any>(`SELECT id, password FROM users WHERE id = ? LIMIT 1`, [user.id]);
          if (!dbUser) return fail(404, "ইউজার পাওয়া যায়নি।");

          const isMatch = await verifyPassword(currentPassword, dbUser.password);
          if (!isMatch) {
            return fail(400, "বর্তমান পাসওয়ার্ডটি সঠিক নয়।");
          }

          const newHash = await hashPassword(newPassword);
          await exec(`UPDATE users SET password = ? WHERE id = ?`, [newHash, user.id]);

          return ok({ message: "এডমিন পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে 🔒" });
        }),
    },
  },
});
