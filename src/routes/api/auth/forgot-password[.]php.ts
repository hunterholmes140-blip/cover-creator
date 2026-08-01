import { createFileRoute } from "@tanstack/react-router";
import { qOne, exec } from "@/lib/db.server";
import { handle, ok, fail } from "@/lib/auth.server";
import { sendEmail } from "@/lib/email.server";

export const Route = createFileRoute("/api/auth/forgot-password.php")({
  server: {
    handlers: {
      POST: async ({ request }) =>
        handle(async () => {
          const body = await request.json().catch(() => ({}));
          const email = String(body.email || "").trim().toLowerCase();

          if (!email || !email.includes("@")) {
            return fail(400, "অনুগ্রহ করে একটি সঠিক ইমেইল প্রদান করুন।");
          }

          // Check if user exists
          const user = await qOne<any>(`SELECT id, name, email FROM users WHERE email = ? LIMIT 1`, [email]);
          if (!user) {
            return fail(404, "এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি।");
          }

          // Create password_resets table if missing
          await exec(`
            CREATE TABLE IF NOT EXISTS password_resets (
              id INT AUTO_INCREMENT PRIMARY KEY,
              email VARCHAR(255) NOT NULL,
              code VARCHAR(10) NOT NULL,
              expires_at DATETIME NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_email_code (email, code)
            )
          `).catch(() => {});

          // Generate 6-digit OTP code
          const code = Math.floor(100000 + Math.random() * 900000).toString();

          // Delete existing codes for this email to keep table clean
          await exec(`DELETE FROM password_resets WHERE email = ?`, [email]).catch(() => {});

          // Store new OTP valid for 15 minutes
          const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ");
          await exec(
            `INSERT INTO password_resets (email, code, expires_at) VALUES (?, ?, ?)`,
            [email, code, expiresAt]
          );

          // Send Email with OTP
          const emailSubject = "🔑 আপনার পাসওয়ার্ড রিসেট ভেরিফিকেশন কোড - Vencon Academy";
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-radius: 10px; background-color: #ffffff;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #ea580c; margin: 0;">Vencon Academy</h2>
                <p style="color: #64748b; font-size: 14px; margin-top: 4px;">পাসওয়ার্ড রিসেট অনুরোধ</p>
              </div>
              <p style="color: #334155; font-size: 15px;">প্রিয় <strong>${user.name || "শিক্ষার্থী"}</strong>,</p>
              <p style="color: #475569; font-size: 14px; line-height: 1.5;">
                আপনার Vencon Academy অ্যাকাউন্টের পাসওয়ার্ড রিসেট করার জন্য নিচে ৬-সংখ্যার ভেরিফিকেশন কোডটি দেওয়া হলো:
              </p>
              <div style="text-align: center; margin: 25px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ea580c; background-color: #fff7ed; padding: 12px 24px; border-radius: 8px; border: 1px dashed #fdba74; display: inline-block;">
                  ${code}
                </span>
              </div>
              <p style="color: #64748b; font-size: 13px; text-align: center;">
                ⏰ এই কোডটির মেয়াদ আগামী <strong>১৫ মিনিট</strong> পর্যন্ত থাকবে।
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                যদি আপনি পাসওয়ার্ড রিসেট করার অনুরোধ না করে থাকেন, তবে এই ইমেইলটি উপেক্ষা করুন।
              </p>
            </div>
          `;

          const sent = await sendEmail({
            to: email,
            subject: emailSubject,
            html: emailHtml,
          });

          if (!sent) {
            return fail(500, "ইমেইল পাঠাতে ব্যর্থ হয়েছে। অনুগ্রহ করে সিস্টেম এডমিনের সাথে যোগাযোগ করুন।");
          }

          return ok({ message: "আপনার ইমেইলে ৬-সংখ্যার ভেরিফিকেশন কোড পাঠানো হয়েছে।" });
        }),
    },
  },
});
