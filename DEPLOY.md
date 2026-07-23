# NextScale Academy — Deployment Guide (Hostinger)

**আপনার সাইট এখন Node (TanStack Start) হিসেবে চলছে।** কোনো PHP লাগবে না।
সব API আছে `src/routes/api/**/*.php.ts` ফাইলগুলোর ভিতরে।

---

## ধাপ ১ — ডাটাবেজ তৈরি

1. hPanel → **Databases → MySQL** থেকে database তৈরি করুন
   (যেমন: `u399219073_course`) এবং user + password তৈরি করে database-এ assign করুন।
2. **phpMyAdmin** খুলুন → database সিলেক্ট করে **Import** ট্যাবে `database/schema.sql`
   আপলোড করে **Go** চাপুন।

## ধাপ ২ — Environment variables সেট করুন

hPanel → Websites → vencon.com.bd → **Environment variables** থেকে নিচের ৫টা
value যোগ করুন:

| Name         | Value                                    |
| ------------ | ---------------------------------------- |
| `DB_HOST`    | `127.0.0.1` — `localhost` দেবেন না       |
| `DB_NAME`    | `u399219073_course`                      |
| `DB_USER`    | `u399219073_course`                      |
| `DB_PASS`    | আপনার MySQL পাসওয়ার্ড                    |
| `JWT_SECRET` | ৩২+ ক্যারেক্টারের একটা random string     |

`JWT_SECRET` বানানোর সহজ উপায়: `openssl rand -hex 32` অথবা পাসওয়ার্ড ম্যানেজার।

> **VITE_API_URL সেট করার দরকার নেই** — কোড অটোমেটিক same-origin `/api` ব্যবহার করবে।

> **Important:** `Access denied for user ... @'::1'` দেখালে বুঝবেন live app এখনও
> `localhost`/IPv6 দিয়ে connect করছে। `DB_HOST` অবশ্যই `127.0.0.1` দিন এবং
> GitHub deploy/redeploy শেষ হয়েছে কিনা নিশ্চিত করুন।

## ধাপ ৩ — GitHub থেকে ডিপ্লয়

GitHub push করলেই Hostinger automatic redeploy করবে। Deployment complete হলে
`https://vencon.com.bd/api/courses/list.php` এ ভিজিট করে JSON রেসপন্স দেখুন।

## ধাপ ৪ — Admin এ লগইন

- URL: `https://vencon.com.bd/admin/login`
- ইমেইল: `admin@nextscale.com`
- পাসওয়ার্ড: `admin123`

লগইন করেই **অবশ্যই পাসওয়ার্ড বদলান** (Admin → Settings)।

---

## API Endpoints

সব endpoint same-origin, prefix `/api/`।

**Public**
| Method | Path                              |
| ------ | --------------------------------- |
| GET    | `/api/courses/list.php`           |
| GET    | `/api/courses/detail.php?slug=`   |
| GET    | `/api/courses/categories.php`     |
| GET    | `/api/content.php?key=`           |
| GET    | `/api/content/trainers.php`       |
| GET    | `/api/content/testimonials.php`   |
| GET    | `/api/content/faqs.php`           |
| GET    | `/api/content/posts.php`          |

**Auth**
| Method | Path                          |
| ------ | ----------------------------- |
| POST   | `/api/auth/register.php`      |
| POST   | `/api/auth/login.php`         |
| POST   | `/api/auth/admin-login.php`   |
| GET    | `/api/auth/me.php`            |

**User (Bearer token লাগবে)**
| Method | Path                          |
| ------ | ----------------------------- |
| GET    | `/api/courses/my-courses.php` |
| GET    | `/api/orders/my-orders.php`   |
| POST   | `/api/orders/create.php`      |

**Admin (Bearer token লাগবে, role=admin)**
| Method            | Path                          |
| ----------------- | ----------------------------- |
| GET               | `/api/admin/stats.php`        |
| GET/POST/PUT/DEL  | `/api/admin/courses.php`      |
| GET/POST/PUT/DEL  | `/api/admin/categories.php`   |
| GET/POST/PUT/DEL  | `/api/admin/lessons.php`      |
| GET/PUT/DEL       | `/api/admin/orders.php`       |
| GET/DEL           | `/api/admin/users.php`        |
| GET/PUT           | `/api/admin/settings.php`     |
| PUT               | `/api/admin/content.php`      |

---

## Troubleshooting

- **500 error / "DB_USER missing"** — Environment variables সঠিকভাবে সেট
  হয়েছে কিনা চেক করুন; সেট করার পর redeploy দিন।
- **"Access denied ... @'::1'"** — `DB_HOST` value `localhost` থাকলে এটা হয়।
  `DB_HOST=127.0.0.1` করুন, নতুন MySQL password `DB_PASS` এ বসান, তারপর Hostinger
  থেকে **Redeploy** দিন। Browser cache নয় — API URL refresh করে দেখুন:
  `https://vencon.com.bd/api/courses/list.php`।
- **"এই ইমেইল আগেই ব্যবহৃত"** কিন্তু কোনো user নেই — phpMyAdmin এ `users`
  টেবিল চেক করুন।
- **Admin পাসওয়ার্ড কাজ করছে না** — schema.sql এ ডিফল্ট hash আছে (`admin123`)।
  বদলাতে চাইলে bcrypt hash generate করে UPDATE করুন।
- **404 on `/api/*`** — deployment logs চেক করুন, রুট ফাইল build এ ঢুকেছে
  কিনা দেখুন।
