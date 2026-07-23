
# NextScale-style কোর্স সেলিং সাইট — Hostinger (PHP + MySQL)

দুইটা অংশে ভাগ করবো: **(১) SQL ফাইল** যেটা আপনি phpMyAdmin-এ import করবেন, **(২) PHP API + React ফ্রন্টএন্ড** যেটা Hostinger-এ আপলোড করবেন।

---

## ১. ডাটাবেজ (SQL — phpMyAdmin-এ import)

`database/schema.sql` — একটাই ফাইল, সব টেবিল + ডিফল্ট এডমিন সহ:

- `admins` — id, name, email, password (bcrypt hash), created_at
- `users` — id, name, email, phone, password, created_at
- `categories` — id, name, slug
- `courses` — id, title, slug, description, thumbnail, price, discount_price, category_id, instructor, duration, level, is_published, created_at
- `lessons` — id, course_id, title, video_url, sort_order, is_preview
- `orders` — id, user_id, course_id, amount, payment_method (bkash/nagad/manual), transaction_id, status (pending/approved/rejected), created_at
- `enrollments` — id, user_id, course_id, enrolled_at (order approve হলে auto create)
- `site_settings` — key, value (সাইট টাইটেল, লোগো, hero টেক্সট, bKash/Nagad নম্বর)

ডিফল্ট এডমিন: `admin@nextscale.com` / `admin123` (পরে চেঞ্জ করবেন)।

---

## ২. PHP API (`/api/` ফোল্ডার — Hostinger public_html-এ যাবে)

সব endpoint JSON return করবে, JWT-এর বদলে সহজ session token ব্যবহার করবো।

```
api/
  config.php            — DB connection, CORS headers, helper functions
  auth/
    register.php        — user signup
    login.php           — user login → token
    admin-login.php     — admin login → token
    me.php              — current user info
  courses/
    list.php            — public: সব published কোর্স
    detail.php          — public: single course + lessons
    my-courses.php      — user's enrolled courses
  orders/
    create.php          — checkout (bKash/Nagad transaction ID সহ)
    my-orders.php       — user's own orders
  admin/
    courses.php         — GET/POST/PUT/DELETE কোর্স
    categories.php      — CRUD
    orders.php          — সব অর্ডার + approve/reject
    users.php           — user list
    settings.php        — সাইট সেটিংস
    upload.php          — thumbnail upload → /uploads/
```

সিকিউরিটি: prepared statements (SQL injection prevent), password_hash/verify, admin endpoint-এ token check।

---

## ৩. React ফ্রন্টএন্ড

**Public পেজ:**
- `/` হোম — hero, featured courses, categories, CTA
- `/courses` সব কোর্স (filter/search)
- `/courses/:slug` কোর্স ডিটেইলস — description, curriculum, preview video, "Enroll করুন" বাটন
- `/checkout/:slug` — bKash/Nagad নম্বরে সেন্ড money → transaction ID submit
- `/login`, `/register`
- `/about`, `/contact`

**ইউজার এরিয়া:**
- `/dashboard` — আমার কোর্স, অর্ডার হিস্ট্রি
- `/learn/:slug` — enrolled হলে video lessons

**এডমিন প্যানেল (`/admin`):**
- `/admin/login`
- `/admin` — stats (total users, courses, pending orders, revenue)
- `/admin/courses` — লিস্ট + add/edit/delete
- `/admin/courses/new`, `/admin/courses/:id/edit` — form + lesson editor
- `/admin/categories`
- `/admin/orders` — pending অর্ডার approve/reject
- `/admin/users`
- `/admin/settings` — bKash/Nagad নম্বর, সাইট টাইটেল

**কনফিগ:** `.env`-এ `VITE_API_URL=https://yourdomain.com/api` সেট করবেন।

---

## ৪. ডিজাইন

Clean professional bilingual (বাংলা primary), light theme, minimal — Bengali-friendly font (Hind Siliguri / Noto Sans Bengali), primary color deep blue/teal।

---

## ৫. আপনি যা করবেন (ডেলিভারির পর)

1. phpMyAdmin → `schema.sql` import
2. `api/config.php`-এ DB credentials বসান
3. `api/` ফোল্ডার Hostinger `public_html/api/`-তে আপলোড
4. `npm run build` → `dist/` এর ফাইল `public_html/`-এ আপলোড
5. `.htaccess` দিবো — React Router refresh 404 fix করার জন্য
6. `admin@nextscale.com` / `admin123` দিয়ে লগইন → পাসওয়ার্ড ও bKash নম্বর আপডেট

---

## ⚠️ সীমাবদ্ধতা

- **Lovable প্রিভিউতে সাইট কাজ করবে না** (PHP নেই) — শুধু UI দেখা যাবে, API call fail হবে। আসল টেস্ট Hostinger-এ আপলোডের পর।
- পেমেন্ট **ম্যানুয়াল** (bKash/Nagad পাঠিয়ে transaction ID সাবমিট → এডমিন approve)। অটো পেমেন্ট গেটওয়ে চাইলে আলাদা কাজ।

---

## স্কেল বড় — কীভাবে ডেলিভার করবো

এত বড় স্কোপ এক টার্নে সম্ভব না। ৩ ধাপে ডেলিভার করবো:

- **ধাপ ১ (এই টার্ন):** SQL schema + সম্পূর্ণ PHP API + `.htaccess` + README
- **ধাপ ২:** React public সাইট (home, courses, details, checkout, auth, dashboard)
- **ধাপ ৩:** React এডমিন প্যানেল (সব CRUD)

**ধাপ ১ শুরু করবো — কনফার্ম করলে এগোই।**
