import { createFileRoute } from "@tanstack/react-router";
import { qOne, exec } from "@/lib/db.server";
import { handle, ok, fail, bearerFrom } from "@/lib/auth.server";

async function hmacSha512Base64(hashKey: string, textToHash: string): Promise<string> {
  if (!hashKey || !textToHash) return "";
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(hashKey);
    const textData = encoder.encode(textToHash);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, textData);
    const bytes = new Uint8Array(signature);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch {
    return "";
  }
}

export const Route = createFileRoute("/api/payment/eps-verify.php")({
  server: {
    handlers: {
      POST: async ({ request }) =>
        handle(async () => {
          const body = await request.json().catch(() => ({}));
          const url = new URL(request.url);
          const txId = String(body.transaction_id || body.merchantTransactionId || url.searchParams.get("txId") || url.searchParams.get("transaction_id") || "").trim();
          const orderId = Number(body.order_id || url.searchParams.get("order_id"));

          if (!txId && !orderId) {
            return fail(400, "transaction_id বা order_id প্রয়োজন");
          }

          // Fetch order from DB
          let order: any = null;
          if (txId) {
            order = await qOne<any>(`SELECT o.*, u.name AS user_name, u.email AS user_email, c.title AS course_title FROM orders o JOIN users u ON u.id = o.user_id JOIN courses c ON c.id = o.course_id WHERE o.transaction_id = ? LIMIT 1`, [txId]);
          } else if (orderId) {
            order = await qOne<any>(`SELECT o.*, u.name AS user_name, u.email AS user_email, c.title AS course_title FROM orders o JOIN users u ON u.id = o.user_id JOIN courses c ON c.id = o.course_id WHERE o.id = ? LIMIT 1`, [orderId]);
          }

          if (!order) {
            return fail(404, "অর্ডার রেকর্ডটি পাওয়া যায়নি।");
          }

          const targetTxId = order.transaction_id || txId;

          // Fetch EPS Credentials
          let epsConfig = {
            enabled: 1,
            is_sandbox: 1,
            username: "",
            password: "",
            merchant_id: "",
            store_id: "",
            hash_key: "",
          };

          try {
            const row = await qOne<any>(
              `SELECT content_json FROM site_content WHERE content_key = 'eps_settings' LIMIT 1`
            );
            if (row?.content_json) {
              epsConfig = { ...epsConfig, ...JSON.parse(row.content_json) };
            }
          } catch (err) {
            console.error("[EPS Verify] Settings load error:", err);
          }

          const { username, password, hash_key } = epsConfig;

          // If Credentials are missing, we cannot verify via API
          if (!username || !password || !hash_key) {
            return fail(400, "EPS গেটওয়ে ক্রেডেনশিয়ালস অ্যাডমিন প্যানেলে কনফিগার করা নেই।");
          }

          const baseUrl = "https://pgapi.eps.com.bd";

          // Step 1: Auth Token
          let token = "";
          try {
            const tokenHash = await hmacSha512Base64(hash_key, username);
            const tokenRes = await fetch(`${baseUrl}/v1/Auth/GetToken`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-hash": tokenHash,
              },
              body: JSON.stringify({ userName: username, password: password }),
            });

            const tokenJson = await tokenRes.json().catch(() => ({}));
            if (!tokenRes.ok || !tokenJson.token) {
              return fail(400, `EPS Auth টোকেন ব্যর্থ: ${tokenJson.errorMessage || "Authentication failed"}`);
            }
            token = tokenJson.token;
          } catch (e: any) {
            return fail(500, `EPS সংযোগ ব্যর্থ: ${e.message}`);
          }

          // Step 2: Check Transaction Status
          let epsStatus = "UNKNOWN";
          let isSuccess = false;

          try {
            const statusHash = await hmacSha512Base64(hash_key, targetTxId);
            const statusRes = await fetch(
              `${baseUrl}/v1/EPSEngine/CheckMerchantTransactionStatus?merchantTransactionId=${encodeURIComponent(targetTxId)}`,
              {
                method: "GET",
                headers: {
                  "x-hash": statusHash,
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const statusJson = await statusRes.json().catch(() => ({}));
            const rawStatus = String(
              statusJson.Status || statusJson.status || statusJson.TransactionStatus || statusJson.StatusCode || ""
            ).toUpperCase();

            epsStatus = rawStatus;

            // Verified success keywords
            if (
              rawStatus === "SUCCESS" ||
              rawStatus === "SUCCESSFUL" ||
              rawStatus === "COMPLETED" ||
              rawStatus === "PAID" ||
              rawStatus === "200" ||
              rawStatus === "1"
            ) {
              isSuccess = true;
            }
          } catch (err: any) {
            console.error("[EPS Verify] Verification call failed:", err);
          }

          if (isSuccess) {
            // Update order status to approved
            await exec(`UPDATE orders SET status = 'approved' WHERE id = ?`, [order.id]);

            // Auto-enroll student
            await exec(
              `INSERT IGNORE INTO enrollments (user_id, course_id, order_id) VALUES (?, ?, ?)`,
              [order.user_id, order.course_id, order.id]
            );

            // Send confirmation email
            if (order.user_email) {
              const { sendTemplatedEmail } = await import("@/lib/email.server");
              sendTemplatedEmail("payment_success", order.user_email, {
                user_name: order.user_name || "Student",
                user_email: order.user_email,
                course_title: order.course_title,
                amount: order.amount,
                transaction_id: targetTxId,
                dashboard_url: "https://vencon.com.bd/dashboard",
              }).catch(() => {});
            }

            return ok({
              verified: true,
              status: "approved",
              message: "পেমেন্ট সফল এবং সম্পূর্ণ ভেরিফাইড। কোর্স এনরোলমেন্ট সম্পন্ন হয়েছে।",
              eps_status: epsStatus,
            });
          } else {
            // Update order status to rejected / payment failed
            await exec(`UPDATE orders SET status = 'rejected' WHERE id = ?`, [order.id]);

            return ok({
              verified: false,
              status: "rejected",
              message: "পেমেন্ট সম্পূর্ণ হয়নি বা ভেরিফিকেশনে ব্যর্থ হয়েছে (Payment Failed/Canceled)।",
              eps_status: epsStatus,
            });
          }
        }),

      GET: async ({ request }) =>
        handle(async () => {
          const url = new URL(request.url);
          const txId = String(url.searchParams.get("txId") || url.searchParams.get("transaction_id") || "").trim();
          const orderId = Number(url.searchParams.get("order_id"));

          if (!txId && !orderId) return fail(400, "transaction_id প্রয়োজন");

          // Delegate to POST handler logic
          const req = new Request(request.url, {
            method: "POST",
            headers: request.headers,
            body: JSON.stringify({ transaction_id: txId, order_id: orderId }),
          });

          return Route.options.server?.handlers.POST({ request: req } as any);
        }),
    },
  },
});
