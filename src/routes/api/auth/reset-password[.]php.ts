import { createFileRoute } from "@tanstack/react-router";
import { qOne, exec } from "@/lib/db.server";
import { handle, ok, fail, hashPassword } from "@/lib/auth.server";

export const Route = createFileRoute("/api/auth/reset-password.php")({
  server: {
    handlers: {
      POST: async ({ request }) =>
        handle(async () => {
          const body = await request.json().catch(() => ({}));
          const email = String(body.email || "").trim().toLowerCase();
          const code = String(body.code || "").trim();
          const newPassword = String(body.new_password || "").trim();

          if (!email || !code || !newPassword) {
            return fail(400, "ইমেইল, ভেরিফিকেশন কোড এবং নতুন পাসওয়ার্ড প্রয়োজন।");
          }

          if (newPassword.length < 6) {
            return fail(400, "নতুন পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে।");
          }

          // Verify code from password_resets table
          const resetRow = await qOne<any>(
            `SELECT id, email, code, expires_at FROM password_resets 
             WHERE email = ? AND code = ? AND expires_at > NOW() 
             ORDER BY id DESC LIMIT 1`,
            [email, code]
          );

          if (!resetRow) {
            return fail(400, "ভেরিফিকেশন কোডটি ভুল বা মেয়াদ্দোত্তীর্ণ হয়ে গেছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
          }

          // Hash new password and update user record
          const hash = await hashPassword(newPassword);
          const updateRes = await exec(`UPDATE users SET password = ? WHERE email = ?`, [hash, email]);

          if (updateRes.affectedRows === 0) {
            return fail(404, "ইউজার অ্যাকাউন্ট পাওয়া যায়নি।");
          }

          // Delete used reset tokens
          await exec(`DELETE FROM password_resets WHERE email = ?`, [email]).catch(() => {});

          return ok({ message: "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে। নতুন পাসওয়ার্ড দিয়ে লগইন করুন।" });
        }),
    },
  },
});
