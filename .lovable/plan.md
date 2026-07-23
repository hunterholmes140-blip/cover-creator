## লক্ষ্য
1. সাইটের **সব দৃশ্যমান কন্টেন্ট** এডমিন প্যানেল থেকে এডিট করা যাবে।
2. **প্রিভিউতে** (Lovable) — এখনকার মতো `localStorage` তে সেভ হবে (একা একা কাজ করা যাবে)।
3. **Hostinger-এ লাইভ করার সাথে সাথেই** — একই এডমিন প্যানেল অটোমেটিক PHP API + MySQL-এ সেভ করবে, ফলে সব ভিজিটরের কাছে গ্লোবালি চেঞ্জ দেখাবে। কোনো কোড বদল লাগবে না, শুধু `.env`-এ API URL দিলেই সুইচ হবে।

## কভারেজ (যা যা এডিটেবল হবে)
- ব্র্যান্ড, লোগো, কালার, WhatsApp/ফোন/ইমেইল, সোশ্যাল — ✅ আগেই আছে
- কোর্স, ক্যাটাগরি, ট্রেনার, ব্লগ, হিরো ভিডিও, ভিডিও গ্যালারি, পেইজ কন্টেন্ট, অর্ডার, ইউজার, পেমেন্ট — ✅ আগেই আছে
- **নতুন যোগ হবে:**
  - সব **সেকশন হেডলাইন/সাব-টাইটেল** (হোমপেজের প্রতিটা সেকশন: জনপ্রিয় ক্যাটাগরি, ফিচার্ড কোর্স, ট্রেনার, ভিডিও, ব্লগ, টেস্টিমোনিয়াল, FAQ)
  - **হোমপেজ CTA/ব্যানার** (টাইটেল, সাব-টেক্সট, বাটন লেবেল/লিঙ্ক, ব্যাকগ্রাউন্ড)
  - **টেস্টিমোনিয়াল** CRUD (নাম, ছবি, রেটিং, মন্তব্য, কোর্স)
  - **FAQ** CRUD
  - ফুটার লিঙ্ক/কলাম টেক্সট
  - SEO (মেটা টাইটেল/ডেসক্রিপশন per page)

## আর্কিটেকচার — "auto-global on live"

### একটা রিমোট-অ্যাডাপ্টার লেয়ার
`src/lib/admin-store.ts`-এর `Collection` ক্লাসকে দুই মোডে চালাবে:

```
if (import.meta.env.VITE_API_BASE)  →  fetch(`${VITE_API_BASE}/content/<key>`)
else                                 →  localStorage (এখনকার মতো)
```

- প্রতিটা কালেকশনের `load / persist` API-aware হবে।
- অপটিমিস্টিক UI: এডমিন সেভ করলে সাথে সাথে স্ক্রিনে দেখাবে, ব্যাকগ্রাউন্ডে POST যাবে।
- পাবলিক পেজে প্রথম লোডে `GET` করে ক্যাশে রাখবে (React Query-স্টাইল, in-memory)।

### PHP জেনেরিক content endpoint
বেশিরভাগ কালেকশনের জন্য (testimonials, faqs, section-headings, cta, footer, seo) একটাই টেবিল যথেষ্ট — key/value JSON:

```sql
CREATE TABLE site_content (
  content_key   VARCHAR(64) PRIMARY KEY,   -- e.g. 'testimonials', 'section.headings', 'home.cta'
  content_json  LONGTEXT NOT NULL,         -- JSON payload
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

দুইটা এন্ডপয়েন্ট:
- `GET  /content.php?key=xxx`  → public (সাইটে দেখানো)
- `PUT  /admin/content.php`    → admin only, `{key, value}` সেভ

কোর্স/ট্রেনার/ব্লগ/অর্ডারের মতো relational ডেটার জন্য আগে থেকেই আলাদা endpoint আছে — সেগুলোতে GET/PUT/POST/DELETE কমপ্লিট করবো।

### লাইভে সুইচ
Hostinger-এ ডিপ্লয়ের সময় শুধু `.env.production`-এ:
```
VITE_API_BASE=https://yourdomain.com/api
```
বসিয়ে `bun run build` — ব্যস, এডমিন প্যানেল অটোমেটিক গ্লোবাল হয়ে যাবে।

## এই স্টেপে যা করবো (প্রিভিউতে ভিজিবল কাজ)
1. **নতুন এডিটেবল কন্টেন্ট স্টোর যোগ:** `section-headings`, `home-cta`, `footer-content`, `seo-meta` — সব `Collection`-এ।
2. **নতুন এডমিন পেইজ:**
   - `/admin/homepage`  — সব সেকশন হেডলাইন, সাব-টাইটেল, CTA/ব্যানার
   - `/admin/testimonials`  — CRUD
   - `/admin/faqs`  — CRUD
   - `/admin/footer`  — ফুটার কলাম টেক্সট
   - `/admin/seo`  — per-page মেটা
3. **পাবলিক পেজ wire:** `index.tsx`, Layout ফুটার, প্রতিটা রুটের `head()` — সব হার্ডকোডেড টেক্সট এই স্টোর থেকে পড়বে।
4. **API adapter:** `Collection` ক্লাসে remote mode যোগ করবো (env থাকলে fetch, না থাকলে localStorage)। এখন প্রিভিউতে fallback-এ চলবে।
5. **PHP এন্ডপয়েন্ট + SQL:** `database/schema.sql`-এ `site_content` টেবিল, `php-api/content.php` (public GET) ও `php-api/admin/content.php` (admin PUT) যোগ। বিদ্যমান endpoints (courses/trainers/blog ইত্যাদি)-এ CRUD complete।
6. **DEPLOY.md আপডেট** — `.env.production` উদাহরণ ও এক-লাইনে সুইচ করার steps।

## টেকনিক্যাল ডিটেইলস
- সব `Collection`-এ একটা `remoteKey?: string` অপশন থাকবে। প্রেজেন্ট থাকলে remote mode এলিজিবল।
- Public পেজের প্রথম লোডে `Promise.all` করে all-content prefetch → একটাই request।
- Admin সেভ → PUT → success হলে local cache invalidate।
- ফেইল হলে toast + লোকাল ফলব্যাক (কখনো ডেটা হারাবে না)।
- SSR হেড মেটাগুলো build-time-এ static থাকবে; runtime override হবে ক্লায়েন্টে (SEO-এর জন্য এটাই যথেষ্ট, কারণ Hostinger shared hosting-এ SSR নেই — এটা SPA হয়ে যাবে ওখানে)।

## এই প্ল্যানের বাইরে যা এখন করবো না
- Auth/RBAC — আপনার PHP admin login আগেই আছে; ওটাই কাজ করবে।
- Image upload UI — `upload.php` আগেই আছে, পরের ধাপে wire করবো।

---
Approve দিলে সব ফাইল একসাথে ইমপ্লিমেন্ট করবো।