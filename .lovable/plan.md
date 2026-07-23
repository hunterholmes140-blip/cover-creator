## লক্ষ্য

Hostinger এ ইতিমধ্যে Node (Nitro) সার্ভার চলছে, তাই PHP বাদ দিয়ে সব API TanStack server route হিসেবে রি-ইমপ্লিমেন্ট করবো। আপনার MySQL ডেটাবেজ (u399219073_course) সরাসরি Node থেকে `mysql2` দিয়ে connect করবে। `api/*.php` ফাইলগুলো ডিলিট হবে। Frontend কোড আর `VITE_API_URL` লাগবে না — same-origin `/api/*` কল হবে।

## কী করবো

**1. Dependencies**
- `mysql2` (connection pool), `bcryptjs` (password hash), `jsonwebtoken` (auth token) ইনস্টল করবো।

**2. DB Helper** (`src/lib/db.server.ts`)
- Singleton MySQL connection pool
- Env থেকে creds: `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`, `JWT_SECRET`

**3. Auth Helper** (`src/lib/auth.server.ts`)
- JWT sign/verify, bcrypt hash/compare
- `requireAuth(request)` / `requireAdmin(request)` — Bearer token check

**4. Server Routes** — `.php` extension রেখে exact same path এ (frontend কোড অপরিবর্তিত থাকবে):

```
src/routes/api/
├── auth/login[.]php.ts, register[.]php.ts, me[.]php.ts, admin-login[.]php.ts
├── courses/list[.]php.ts, detail[.]php.ts, categories[.]php.ts, my-courses[.]php.ts
├── orders/create[.]php.ts, my-orders[.]php.ts
├── content/trainers[.]php.ts, testimonials[.]php.ts, faqs[.]php.ts, posts[.]php.ts
├── content[.]php.ts (site-wide content GET)
└── admin/
    ├── stats[.]php.ts, courses[.]php.ts, categories[.]php.ts, lessons[.]php.ts,
    ├── orders[.]php.ts, users[.]php.ts, settings[.]php.ts, content[.]php.ts
    └── upload[.]php.ts (skip — Node পরিবেশে আলাদা approach, পরে করবো)
```

**5. Response shape রাখবো PHP এর মতোই** — `{ success: true, data: {...} }` — যাতে existing `api.ts` client কোনো পরিবর্তন ছাড়াই কাজ করে।

**6. Cleanup**
- পুরো `api/` (PHP) ফোল্ডার ডিলিট
- `.env.example` আপডেট: `DB_HOST=127.0.0.1`, `DB_NAME=u399219073_course`, `DB_USER=u399219073_course`, `DB_PASS=...`, `JWT_SECRET=...`
- `VITE_API_URL` আর দরকার নেই (empty রাখলে `api.ts` mock এ পড়ে যাবে) — তাই `api.ts` এ live-check বদলে relative `/api` fetch default করবো

**7. Deploy করার জন্য আপনার করণীয়**
- Hostinger → Environment variables এ শুধু এই ৫টা যোগ করবেন: `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`, `JWT_SECRET`
- GitHub এ push হলে auto-redeploy হবে

## Technical Notes

- `mysql2/promise` pool ব্যবহার — Node runtime, Cloudflare Workers না, তাই সব স্ট্যান্ডার্ড Node APIs available
- Prepared statements দিয়ে SQL injection prevention
- Password: bcrypt cost 10
- JWT: HS256, 7-day expiry
- Admin routes এ role check middleware
- File upload endpoint এখন skip করবো (Hostinger Node এ persistent storage আলাদা issue) — course thumbnail গুলো আপাতত external URL হিসেবে দিতে হবে; পরের ধাপে দেখবো

## Scope

মোট ~২২টা route file, ২টা helper, ১টা client tweak, পুরনো PHP delete। এক ধাপে সব করবো।

আপনি approve করলে শুরু করি?