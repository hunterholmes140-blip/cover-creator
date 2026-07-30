import { createFileRoute } from "@tanstack/react-router";
import { qOne, exec } from "@/lib/db.server";
import { handle, ok, fail, requireAdmin } from "@/lib/auth.server";
import { DEFAULT_EMAIL_TEMPLATES, getSmtpConfig } from "@/lib/email.server";

export const Route = createFileRoute("/api/admin/email-settings.php")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);

          let templates = DEFAULT_EMAIL_TEMPLATES;
          let smtp = await getSmtpConfig();

          try {
            const rowTpl = await qOne<any>(`SELECT content_json FROM site_content WHERE content_key = 'email_templates' LIMIT 1`);
            if (rowTpl?.content_json) {
              templates = { ...DEFAULT_EMAIL_TEMPLATES, ...JSON.parse(rowTpl.content_json) };
            }
          } catch {}

          return ok({ templates, smtp });
        }),

      POST: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          const body = await request.json().catch(() => ({}));
          const { templates, smtp } = body;

          if (templates) {
            const jsonStr = JSON.stringify(templates);
            await exec(
              `INSERT INTO site_content (content_key, content_json) VALUES ('email_templates', ?)
               ON DUPLICATE KEY UPDATE content_json = VALUES(content_json)`,
              [jsonStr]
            );
          }

          if (smtp) {
            const jsonStr = JSON.stringify(smtp);
            await exec(
              `INSERT INTO site_content (content_key, content_json) VALUES ('email_settings', ?)
               ON DUPLICATE KEY UPDATE content_json = VALUES(content_json)`,
              [jsonStr]
            );
          }

          return ok({ message: "ইমেইল টেমপ্লেট ও সেটিংস সফলভাবে সংরক্ষিত হয়েছে।" });
        }),
    },
  },
});
