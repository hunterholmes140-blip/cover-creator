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
          const slug = url.searchParams.get("slug");
          const savedTrainers = await readKey("trainers");
          const trainers: any[] = Array.isArray(savedTrainers) && savedTrainers.length > 0
            ? savedTrainers
            : (MOCK_TRAINERS as any[]);
          if (slug) {
            const trainer = trainers.find((t) => t.slug === slug);
            if (!trainer) return ok({ trainer: null, courses: [] });
            return ok({ trainer, courses: [] });
          }
          return ok({ trainers });
        }),
    },
  },
});
