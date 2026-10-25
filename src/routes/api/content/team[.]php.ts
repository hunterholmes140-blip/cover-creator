// Team content endpoints that map to site_content JSON keys or mock data
import { createFileRoute } from "@tanstack/react-router";
import { qOne } from "@/lib/db.server";
import { handle, ok } from "@/lib/auth.server";
import { MOCK_TEAM_MEMBERS } from "@/lib/mock-data";

async function readKey(key: string): Promise<any> {
  const row = await qOne<any>(
    `SELECT content_json FROM site_content WHERE content_key = ? LIMIT 1`,
    [key],
  );
  if (!row) return null;
  try { return JSON.parse(row.content_json); } catch { return null; }
}

export const Route = createFileRoute("/api/content/team.php")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        handle(async () => {
          const url = new URL(request.url);
          const rawSlug = url.searchParams.get("slug") || url.searchParams.get("id");
          const dept = url.searchParams.get("department") || url.searchParams.get("dept");
          const savedTeam = await readKey("team");
          const team: any[] = Array.isArray(savedTeam) && savedTeam.length > 0
            ? savedTeam
            : (MOCK_TEAM_MEMBERS as any[]);

          if (rawSlug) {
            const target = decodeURIComponent(rawSlug).trim().toLowerCase();
            const member = team.find((m: any) => {
              if (!m) return false;
              const s = (m.slug || "").trim().toLowerCase();
              const empId = (m.employee_id || "").trim().toLowerCase();
              const id = String(m.id || "").trim().toLowerCase();
              return s === target || empId === target || id === target;
            });

            return ok({ member: member || null });
          }

          if (dept) {
            const targetDept = decodeURIComponent(dept).trim().toLowerCase();
            const filtered = team.filter((m: any) => {
              const d = (m.department || "").trim().toLowerCase();
              return d === targetDept;
            });
            return ok({ team: filtered });
          }

          return ok({ team });
        }),
    },
  },
});
