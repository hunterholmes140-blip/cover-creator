# NextScale Academy — Deployment Guide (Hostinger)

## ধাপ ১ — ডাটাবেজ তৈরি

1. Hostinger cPanel → **MySQL Databases** → নতুন database তৈরি করুন
   (যেমন: `u123456_nextscale`), user + password তৈরি করে database-এ assign করুন।
2. **phpMyAdmin** খুলুন → নতুন database সিলেক্ট করুন → **Import** ট্যাব।
3. `database/schema.sql` ফাইল আপলোড করে **Go** চাপুন।

## ধাপ ২ — PHP API আপলোড

1. `php-api/config.php` খুলে আপনার DB credentials বসান:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'u123456_nextscale');
   define('DB_USER', 'u123456_admin');
   define('DB_PASS', 'your-strong-password');
   define('ALLOWED_ORIGIN', 'https://yourdomain.com');
   ```
2. File Manager / FTP দিয়ে `php-api/` ফোল্ডারের সব ফাইল Hostinger-এর
   `public_html/api/` ফোল্ডারে আপলোড করুন।
3. `public_html/uploads/` ফোল্ডার তৈরি করে permission `755` দিন।

## ধাপ ৩ — React ফ্রন্টএন্ড বিল্ড ও আপলোড

1. লোকাল মেশিনে (বা Lovable থেকে ডাউনলোড করে):
   ```bash
   # .env ফাইল তৈরি করুন:
   echo "VITE_API_URL=https://yourdomain.com/api" > .env

   npm install
   npm run build
   ```
2. `dist/` ফোল্ডারের **ভেতরের সব কিছু** (index.html, assets/, ইত্যাদি)
   Hostinger-এর `public_html/` ফোল্ডারে আপলোড করুন।
3. `public/.htaccess` ফাইলটাও `public_html/` এ যাবে (SPA routing এর জন্য)।

## ধাপ ৪ — এডমিন লগইন

- URL: `https://yourdomain.com/admin/login`
- Email: `admin@nextscale.com`
- Password: `admin123`
- **প্রথম লগইনের পর পাসওয়ার্ড অবশ্যই পাল্টান** (এডমিন সেটিংস → পাসওয়ার্ড পরিবর্তন)।

## ধাপ ৫ — সেটিংস কনফিগ

এডমিন প্যানেল → **Settings** এ গিয়ে সেট করুন:
- সাইট নাম, লোগো
- bKash / Nagad / Rocket নম্বর (checkout-এ দেখাবে)
- কন্ট্যাক্ট ইমেইল/ফোন

## ফাইল স্ট্রাকচার (Hostinger public_html/)

```
public_html/
├── index.html              (React build)
├── assets/                 (React JS/CSS)
├── .htaccess               (SPA routing)
├── api/                    (PHP API)
│   ├── config.php
│   ├── auth/
│   ├── courses/
│   ├── orders/
│   └── admin/
└── uploads/                (থাম্বনেইল upload)
```

## API Endpoints (সংক্ষেপে)

| Method | Endpoint                       | কাজ                            |
| ------ | ------------------------------ | ------------------------------ |
| POST   | /api/auth/register.php         | ইউজার সাইনআপ                   |
| POST   | /api/auth/login.php            | ইউজার লগইন                     |
| POST   | /api/auth/admin-login.php      | এডমিন লগইন                     |
| GET    | /api/auth/me.php               | current user                   |
| GET    | /api/courses/list.php          | সব কোর্স                       |
| GET    | /api/courses/detail.php?slug=  | single কোর্স                   |
| GET    | /api/courses/categories.php    | ক্যাটেগরি লিস্ট                |
| GET    | /api/courses/my-courses.php    | আমার এনরোল্ড কোর্স             |
| POST   | /api/orders/create.php         | নতুন অর্ডার                    |
| GET    | /api/orders/my-orders.php      | আমার অর্ডার                    |
| GET/POST/PUT/DELETE | /api/admin/courses.php  | কোর্স CRUD             |
| GET/POST/PUT/DELETE | /api/admin/lessons.php  | lesson CRUD            |
| GET/POST/PUT/DELETE | /api/admin/categories.php | ক্যাটেগরি CRUD       |
| GET/PUT/DELETE      | /api/admin/orders.php    | অর্ডার approve/reject |
| GET/DELETE          | /api/admin/users.php     | ইউজার লিস্ট           |
| GET/PUT             | /api/admin/settings.php  | সাইট সেটিংস           |
| POST                | /api/admin/upload.php    | ইমেজ আপলোড            |
| GET                 | /api/admin/stats.php     | dashboard stats       |

## Auth কীভাবে কাজ করে

- Login/Register response-এ `token` আসে।
- Frontend সেই token localStorage-এ রাখবে।
- Protected request-এ header: `Authorization: Bearer <token>`।

## সমস্যা?

- **CORS error:** `config.php`-এ `ALLOWED_ORIGIN` আপনার ডোমেইনে সেট করুন।
- **500 error:** Hostinger error log চেক করুন। সাধারণত DB credentials ভুল।
- **404 on refresh:** `.htaccess` ঠিকমতো আপলোড হয়নি।
