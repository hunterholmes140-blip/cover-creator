import { createFileRoute } from "@tanstack/react-router";
import { exec } from "@/lib/db.server";
import { handle, ok, requireAdmin, fail } from "@/lib/auth.server";

export const Route = createFileRoute("/api/admin/content.php")({
  server: {
    handlers: {
      PUT: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          const body = await request.json().catch(() => ({}));
          const key = String(body.key || "").trim();
          if (!key) return fail(400, "key প্রয়োজন");
          const json = JSON.stringify(body.value ?? null);
          await exec(
            `INSERT INTO site_content (content_key, content_json) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE content_json = VALUES(content_json)`,
            [key, json],
          );
          return ok({ key });
        }),
    },
  },
});
