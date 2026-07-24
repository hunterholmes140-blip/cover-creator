import { createFileRoute } from "@tanstack/react-router";
import { qOne } from "@/lib/db.server";
import { handle, ok, fail } from "@/lib/auth.server";

export const Route = createFileRoute("/api/coupons/validate.php")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        handle(async () => {
          const url = new URL(request.url);
          const code = String(url.searchParams.get("code") || "").trim().toUpperCase();
          const amount = Number(url.searchParams.get("amount") || 0);

          if (!code) return fail(400, "কুপন কোড লিখুন");

          const coupon = await qOne<any>(
            `SELECT * FROM coupons WHERE code = ? LIMIT 1`,
            [code]
          );

          // Fallback static coupons if DB row is not created yet
          if (!coupon) {
            if (code === "NEXT500") {
              const discount = 500;
              return ok({
                code: "NEXT500",
                discount_type: "fixed",
                discount_value: 500,
                calculated_discount: discount,
              });
            }
            if (code === "OFF10") {
              const discount = Math.round((amount * 10) / 100);
              return ok({
                code: "OFF10",
                discount_type: "percent",
                discount_value: 10,
                calculated_discount: discount,
              });
            }
            return fail(404, "কুপন কোডটি সঠিক নয় বা মেয়াদ শেষ।");
          }

          if (!coupon.is_active) {
            return fail(400, "এই কুপনটি নিষ্ক্রিয় করা রয়েছে।");
          }

          if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
            return fail(400, "এই কুপনের মেয়াদ শেষ হয়ে গেছে।");
          }

          if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
            return fail(400, "এই কুপনের ব্যবহারের সীমা শেষ।");
          }

          let discount = 0;
          if (coupon.discount_type === "percent") {
            discount = Math.round((amount * Number(coupon.discount_value)) / 100);
          } else {
            discount = Number(coupon.discount_value);
          }

          return ok({
            code: coupon.code,
            discount_type: coupon.discount_type,
            discount_value: Number(coupon.discount_value),
            calculated_discount: discount,
          });
        }),
    },
  },
});
