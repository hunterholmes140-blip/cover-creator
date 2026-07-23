## এডমিন প্যানেল — সম্পূর্ণ A to Z ম্যানেজমেন্ট

বর্তমান এডমিন প্যানেলে শুধু Settings, Courses (badge), Trainers (placeholder), Orders (placeholder) আছে। এটাকে সাইটের প্রতিটি ডাইনামিক অংশ ম্যানেজ করার একটা পূর্ণাঙ্গ কন্ট্রোল সেন্টারে পরিণত করব। ডেমো মোডে সব কিছু `localStorage`-এ সেভ হবে (PHP API আসলে সরাসরি DB-তে যাবে — একই শেপ)।

### নতুন এডমিন সেকশনগুলো

```text
/admin
├── /               → ড্যাশবোর্ড: KPI কার্ড + দ্রুত লিঙ্ক
├── /settings       → (আছে) ব্র্যান্ড, কালার, যোগাযোগ, সোশ্যাল
├── /hero           → হিরো ভিডিও স্লাইডস (heading + YouTube link)
├── /videos         → হোমপেজ ভিডিও গ্যালারি
├── /categories     → কোর্স ক্যাটাগরি CRUD
├── /courses        → কোর্স তালিকা + Add/Edit/Delete + badge + featured
├── /courses/new    → নতুন কোর্স ফর্ম
├── /courses/$slug  → এডিট + লেসন ম্যানেজার
├── /trainers       → ট্রেনার/মেন্টর তালিকা + CRUD
├── /trainers/new   → নতুন ট্রেনার (mentor toggle, expertise, experience CV)
├── /trainers/$slug → এডিট
├── /blog           → ব্লগ পোস্ট CRUD
├── /orders         → অর্ডার তালিকা, approve/reject, ফিল্টার
├── /users          → ইউজার তালিকা, enrollment ভিউ
├── /pages          → About/FAQ/Privacy/Terms/Refund/Affiliate কন্টেন্ট এডিট
└── /payments       → bKash/Nagad/Rocket নাম্বার, পেমেন্ট instructions
```

### সাধারণ প্যাটার্ন
- একটি admin store (`src/lib/admin-store.ts`) — mock data-কে localStorage-এ persist করবে; হুক দিবে (`useCourses`, `useTrainers` ইত্যাদি) যা রিয়েল-টাইম আপডেট দিবে।
- reusable UI: `DataTable`, `FormField`, `Modal`, `ConfirmDialog`, `ImageUrlInput`।
- প্রতিটা list পেজে: সার্চ, ফিল্টার, sort, pagination, bulk delete।
- Form validation + toast notification।
- API লেয়ার (`src/lib/api.ts`) — VITE_API_URL থাকলে PHP-তে call, না থাকলে store।

### সাইড-ইফেক্ট
- পাবলিক পেজগুলো (index, courses, trainers, blog) mock-data ইম্পোর্টের বদলে store হুক ব্যবহার করবে যেন এডমিনে বদলালে সাথে সাথে দেখা যায়।
- নেভিগেশনে নতুন সেকশনগুলো যোগ হবে; মোবাইল drawer + collapsible groups।

### ফেজ (এক প্রম্পটে বেশি জিনিস, সব একসাথে ইমপ্লিমেন্ট)
1. Store + hooks + shared UI প্রিমিটিভ
2. Dashboard, Categories, Courses (list+form+lessons), Trainers (list+form CV)
3. Hero videos, Video gallery, Blog posts
4. Orders, Users, Pages, Payments
5. Admin layout upgrade (grouped nav, mobile drawer)

শেষে PHP API endpoints (`courses.php`, `lessons.php`, `orders.php` ইত্যাদি) ইতোমধ্যে আছে — store হুকগুলো এমনভাবে লিখব যেন পরে `VITE_API_URL` সেট করলেই স্বয়ংক্রিয়ভাবে PHP-তে সুইচ হয়ে যায়, কোড বদলানো লাগবে না।
