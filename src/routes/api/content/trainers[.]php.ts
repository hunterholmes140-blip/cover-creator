// Content endpoints that map to site_content JSON keys
import { createFileRoute } from "@tanstack/react-router";
import { qOne } from "@/lib/db.server";
import { handle, ok } from "@/lib/auth.server";
import { MOCK_TRAINERS } from "@/lib/mock-data";

async function readKey(key: string): Promise<any> {
  const row = await qOne<any>(
    `SELECT content_json FROM site_content WHERE content_key = ? LIMIT 1`,
    [key],
  );
  if (!row) return null;
  try { return JSON.parse(row.content_json); } catch { return null; }
}

export const Route = createFileRoute("/api/content/trainers.php")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        handle(async () => {
          const url = new URL(request.url);
          const rawSlug = url.searchParams.get("slug");
          const savedTrainers = await readKey("trainers");
          const trainers: any[] = Array.isArray(savedTrainers) && savedTrainers.length > 0
            ? savedTrainers
            : (MOCK_TRAINERS as any[]);

          if (rawSlug) {
            const targetSlug = decodeURIComponent(rawSlug).trim().toLowerCase();
            const cleanSlug = targetSlug.replace(/-trainer$/i, "").replace(/^trainer-/i, "");

            let trainer = trainers.find((t: any) => {
              if (!t) return false;
              const s = (t.slug || "").trim().toLowerCase();
              const nameSlug = (t.name || "").trim().toLowerCase().replace(/\s+/g, "-");
              return (
                s === targetSlug ||
                s === cleanSlug ||
                nameSlug === targetSlug ||
                nameSlug === cleanSlug ||
                (cleanSlug && s.includes(cleanSlug)) ||
                (cleanSlug && nameSlug.includes(cleanSlug))
              );
            });

            if (!trainer && trainers.length > 0) {
              trainer = trainers[0];
            }

            return ok({ trainer: trainer || null, courses: [] });
          }

          return ok({ trainers });
        }),
    },
  },
});
