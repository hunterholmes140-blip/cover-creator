import { createFileRoute } from "@tanstack/react-router";
import { q, exec } from "@/lib/db.server";
import { handle, ok, requireAdmin } from "@/lib/auth.server";

export const Route = createFileRoute("/api/admin/settings[.]php")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          const rows = await q<any>(`SELECT setting_key, setting_value FROM site_settings`);
          const settings: Record<string, string> = {};
          rows.forEach((r) => (settings[r.setting_key] = r.setting_value ?? ""));
          return ok({ settings });
        }),

      PUT: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          const body = await request.json().catch(() => ({}));
          const settings = body.settings || body;
          for (const [key, value] of Object.entries(settings as Record<string, any>)) {
            await exec(
              `INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)
               ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
              [key, String(value ?? "")],
            );
          }
          return ok({ ok: true });
        }),
    },
  },
});
