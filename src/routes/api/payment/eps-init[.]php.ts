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

export const Route = createFileRoute("/api/payment/eps-init.php")({
  server: {
    handlers: {
      POST: async ({ request }) =>
        handle(async () => {
          const body = await request.json().catch(() => ({}));
          let user = bearerFrom(request);

          if (!user) {
            const email = String(body.customerEmail || body.email || "").trim().toLowerCase();
            const name = String(body.customerName || body.name || "").trim() || "Student";
            const phone = String(body.customerPhone || body.phone || "").trim() || null;
            const password = String(body.password || "").trim();

            if (email) {
              const existing = await qOne<any>(`SELECT id, name, email, phone FROM users WHERE email = ? LIMIT 1`, [email]);
              if (existing) {
                user = existing;
              } else {
                const defaultPw = password && password.length >= 6 ? password : (phone && phone.length >= 6 ? phone.slice(-6) : "123456");
                const hash = await hashPassword(defaultPw);
                const res = await exec(
                  `INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)`,
                  [name, email, phone, hash]
                );
                user = { id: res.insertId, name, email, phone };
              }
            }
          }

          if (!user) {
            return fail(401, "পেমেন্ট করতে অনুগ্রহ করে নাম ও ইমেইল ফিল্ডটি পূরণ করুন।");
          }

          const course_id = Number(body.course_id);
          if (!course_id) return fail(400, "কোর্স আইডি সিলেক্ট করা হয়নি");

          const course = await qOne<any>(
            `SELECT id, title, price, discount_price FROM courses WHERE id = ? AND is_published = 1`,
            [course_id]
          );
          if (!course) return fail(404, "কোর্স পাওয়া যায়নি");

          const amount = course.discount_price ?? course.price;
          const orderNo = `ORD-${Date.now().toString().slice(-6)}`;
          const txId = `TXN${Date.now()}`;

          // Fetch EPS Settings from database (site_content table)
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
            console.error("[EPS] Failed to load eps_settings from DB:", err);
          }

          const { username, password, merchant_id, store_id, hash_key } = epsConfig;

          if (!username || !password || !merchant_id || !store_id || !hash_key) {
            return fail(
              400,
              "EPS পেমেন্ট গেটওয়ে ক্রেডেনশিয়ালস (Username, Password, Merchant ID, Store ID, Hash Key) এডমিন প্যানেলে সেটআপ করা হয়নি।"
            );
          }

          const baseUrl = "https://pgapi.eps.com.bd";

          // Step 1: GetToken (Server-to-Server)
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
              const errMsg = tokenJson.errorMessage || tokenJson.message || tokenJson.title || "ইউজারনেম বা পাসওয়ার্ড সঠিক নয়।";
              return fail(400, `EPS টোকেন তৈরি ব্যর্থ হয়েছে (${tokenRes.status}): ${errMsg}`);
            }
            token = tokenJson.token;
          } catch (e: any) {
            return fail(500, `EPS সংযোগ ব্যর্থ হয়েছে: ${e.message}`);
          }

          // Step 2: InitializeEPS (Server-to-Server)
          let redirectUrl = "";
          try {
            const initHash = await hmacSha512Base64(hash_key, txId);
            const originUrl = request.headers.get("origin") || "https://vencon.com.bd";
            const returnUrl = `${originUrl}/dashboard`;

            const bodyPayload = {
              storeId: store_id,
              merchantId: merchant_id,
              CustomerOrderId: orderNo,
              merchantTransactionId: txId,
              transactionTypeId: 1, // 1 = Web
              financialEntityId: 0,
              transitionStatusId: 0,
              totalAmount: amount,
              ipAddress: request.headers.get("x-forwarded-for") || "103.12.45.69",
              version: "1",
              successUrl: returnUrl,
              failUrl: returnUrl,
              cancelUrl: returnUrl,
              customerName: user.email || "Student",
              customerEmail: user.email || "student@nextscale.com",
              CustomerAddress: "Dhaka, Bangladesh",
              CustomerAddress2: "Dhaka",
              CustomerCity: "Dhaka",
              CustomerState: "Dhaka",
              CustomerPostcode: "1200",
              CustomerCountry: "BD",
              CustomerPhone: "01700000000",
              ShipmentName: "Digital Course",
              ShipmentAddress: "Online",
              ShipmentCity: "Dhaka",
              ShipmentState: "Dhaka",
              ShipmentPostcode: "1200",
              ShipmentCountry: "BD",
              ValueA: "",
              ValueB: "",
              ValueC: "",
              ValueD: "",
              ShippingMethod: "NO",
              NoOfItem: "1",
              ProductName: course.title,
              ProductProfile: "general",
              ProductCategory: "Education",
            };

            const initRes = await fetch(`${baseUrl}/v1/EPSEngine/InitializeEPS`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-hash": initHash,
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(bodyPayload),
            });

            const initJson = await initRes.json().catch(() => ({}));
            redirectUrl = initJson.RedirectURL || initJson.redirectURL;

            if (!initRes.ok || !redirectUrl) {
              const errMsg = initJson.ErrorMessage || initJson.errorMessage || initJson.title || "Merchant ID বা Store ID সঠিক নয়।";
              return fail(400, `EPS পেমেন্ট লিঙ্ক তৈরি করা যায়নি (${initRes.status}): ${errMsg}`);
            }
          } catch (e: any) {
            return fail(500, `EPS ইনিশিয়ালাইজেশন ব্যর্থ হয়েছে: ${e.message}`);
          }

          // Create pending order record (No course enrollment until EPS verifies actual payment)
          try {
            await exec(
              `INSERT INTO orders (user_id, course_id, amount, payment_method, transaction_id, note, status)
               VALUES (?, ?, ?, 'manual', ?, ?, 'pending')`,
              [user.id, course_id, amount, txId, `EPS Order #${orderNo}`]
            );
          } catch (dbErr) {
            console.error("[EPS] DB order insert warning:", dbErr);
          }

          return ok({ redirectUrl, transactionId: txId });
        }),
    },
  },
});
