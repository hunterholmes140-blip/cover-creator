import { createFileRoute } from "@tanstack/react-router";
import { q, qOne, exec } from "@/lib/db.server";
import { handle, ok, fail, requireAdmin } from "@/lib/auth.server";

export const Route = createFileRoute("/api/admin/coupons.php")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          const list = await q<any>(`SELECT * FROM coupons ORDER BY id DESC`);
          return ok(list);
        }),

      POST: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          const body = await request.json().catch(() => ({}));
          const code = String(body.code || "").trim().toUpperCase();
          const discount_type = body.discount_type === "percent" ? "percent" : "fixed";
          const discount_value = Number(body.discount_value || 0);
          const max_uses = body.max_uses ? Number(body.max_uses) : null;
          const expiry_date = body.expiry_date ? String(body.expiry_date) : null;

          if (!code) return fail(400, "কুপন কোড প্রদান করুন");
          if (discount_value <= 0) return fail(400, "ডিসকাউন্ট পরিমাণ সঠিকভাবে দিন");

          const existing = await qOne<any>(`SELECT id FROM coupons WHERE code = ? LIMIT 1`, [code]);
          if (existing) return fail(400, "এই কুপন কোডটি ইতিমধ্যে রয়েছে");

          const res = await exec(
            `INSERT INTO coupons (code, discount_type, discount_value, max_uses, expiry_date, is_active)
             VALUES (?, ?, ?, ?, ?, 1)`,
            [code, discount_type, discount_value, max_uses, expiry_date]
          );

          return ok({ message: "কুপন সফলভাবে তৈরি করা হয়েছে", id: res.insertId });
        }),

      PUT: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          const body = await request.json().catch(() => ({}));
          const id = Number(body.id);
          if (!id) return fail(400, "আইডি প্রয়োজন");

          const fields: string[] = [];
          const values: any[] = [];

          if (body.code !== undefined) {
            fields.push("code = ?");
            values.push(String(body.code).trim().toUpperCase());
          }
          if (body.discount_type !== undefined) {
            fields.push("discount_type = ?");
            values.push(body.discount_type === "percent" ? "percent" : "fixed");
          }
          if (body.discount_value !== undefined) {
            fields.push("discount_value = ?");
            values.push(Number(body.discount_value));
          }
          if (body.max_uses !== undefined) {
            fields.push("max_uses = ?");
            values.push(body.max_uses ? Number(body.max_uses) : null);
          }
          if (body.expiry_date !== undefined) {
            fields.push("expiry_date = ?");
            values.push(body.expiry_date ? String(body.expiry_date) : null);
          }
          if (body.is_active !== undefined) {
            fields.push("is_active = ?");
            values.push(body.is_active ? 1 : 0);
          }

          if (fields.length === 0) return fail(400, "কোন পরিবর্তন নেই");

          values.push(id);
          await exec(`UPDATE coupons SET ${fields.join(", ")} WHERE id = ?`, values);
          return ok({ message: "কুপন আপডেট করা হয়েছে" });
        }),

      DELETE: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          const url = new URL(request.url);
          const id = Number(url.searchParams.get("id"));
          if (!id) return fail(400, "আইডি প্রয়োজন");

          await exec(`DELETE FROM coupons WHERE id = ?`, [id]);
          return ok({ message: "কুপন মুছে ফেলা হয়েছে" });
        }),
    },
  },
});
