// ============================================================
// Editable text/content defaults — shown when admin has not set anything.
// Every string on the public site's homepage + footer flows through here,
// so it can be edited from /admin/homepage and /admin/footer.
// ============================================================

export type HomeContent = {
  heroBadge: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroSubtitle: string;
  heroCta1Label: string;
  heroCta1Href: string;
  heroCta2Label: string;
  heroCta2Href: string;

  ctaStripText: string;

  stat1: string; stat1Label: string;
  stat2: string; stat2Label: string;
  stat3: string; stat3Label: string;
  stat4: string; stat4Label: string;

  sectionCategoriesTitle: string;
  sectionCategoriesSubtitle: string;
  sectionFeaturedTitle: string;
  sectionFeaturedSubtitle: string;

  sectionMentorEyebrow: string;
  sectionMentorTitle: string;
  sectionMentorSubtitle: string;

  sectionTestimonialsTitle: string;
  sectionTestimonialsSubtitle: string;

  sectionBlogTitle: string;
  sectionBlogSubtitle: string;

  sectionVideoEyebrow: string;
  sectionVideoTitle: string;
  sectionVideoSubtitle: string;

  sectionFaqTitle: string;
  sectionFaqSubtitle: string;

  finalCtaTitle: string;
  finalCtaSubtitle: string;
  finalCtaButton: string;
  finalCtaHref: string;
};

export const HOME_CONTENT_DEFAULTS: HomeContent = {
  heroBadge: "নতুন কোর্স যোগ হয়েছে",
  heroTitle: "আপনার ভবিষ্যৎ শুরু হোক",
  heroTitleAccent: "এখান থেকে",
  heroSubtitle:
    "ইন্ডাস্ট্রি এক্সপার্টদের কাছ থেকে শিখুন আধুনিক স্কিল। ঘরে বসেই ক্যারিয়ার গড়ুন প্রফেশনাল কোর্সে।",
  heroCta1Label: "সব কোর্স দেখুন",
  heroCta1Href: "/courses",
  heroCta2Label: "আমাদের সম্পর্কে",
  heroCta2Href: "/about",

  ctaStripText: "নতুন কোর্স যোগ হয়েছে — এখনই এনরোল করুন",

  stat1: "১০,০০০+", stat1Label: "সক্রিয় শিক্ষার্থী",
  stat2: "৫০+",     stat2Label: "প্রিমিয়াম কোর্স",
  stat3: "২৫+",     stat3Label: "এক্সপার্ট ট্রেনার",
  stat4: "৯৮%",     stat4Label: "সন্তুষ্টির হার",

  sectionCategoriesTitle: "জনপ্রিয় ক্যাটেগরি",
  sectionCategoriesSubtitle: "আপনার পছন্দের বিষয় বেছে নিন",
  sectionFeaturedTitle: "ফিচার্ড কোর্স",
  sectionFeaturedSubtitle: "সবচেয়ে জনপ্রিয় কোর্সগুলো",

  sectionMentorEyebrow: "Founder & Team",
  sectionMentorTitle: "আমাদের মেন্টর ও ট্রেনার",
  sectionMentorSubtitle: "ইন্ডাস্ট্রি-অভিজ্ঞ প্রফেশনালদের কাছ থেকে সরাসরি শিখুন",

  sectionTestimonialsTitle: "শিক্ষার্থীদের মতামত",
  sectionTestimonialsSubtitle: "যারা আমাদের কোর্সে ক্যারিয়ার গড়েছেন — তাদের গল্প।",

  sectionBlogTitle: "সাম্প্রতিক আর্টিকেল",
  sectionBlogSubtitle: "শিক্ষা ও ক্যারিয়ার সংক্রান্ত লেখা",

  sectionVideoEyebrow: "ভিডিও গ্যালারি",
  sectionVideoTitle: "আমাদের ভিডিও লাইব্রেরি",
  sectionVideoSubtitle:
    "কোর্স পরিচিতি, শিক্ষার্থীদের গল্প ও দরকারি টিপস — এক জায়গায়",

  sectionFaqTitle: "সাধারণ প্রশ্নাবলী",
  sectionFaqSubtitle: "যা আপনি জানতে চাইতে পারেন",

  finalCtaTitle: "আজই শুরু করুন আপনার শেখার যাত্রা",
  finalCtaSubtitle:
    "হাজারো শিক্ষার্থীর সাথে যোগ দিন এবং গড়ুন আপনার স্বপ্নের ক্যারিয়ার।",
  finalCtaButton: "ফ্রি রেজিস্টার করুন",
  finalCtaHref: "/register",
};

export type FooterContent = {
  companyHeading: string;
  contactHeading: string;
  quickLinksHeading: string;
  copyright: string;   // supports {year} {brand}
  madeInText: string;
};

export const FOOTER_CONTENT_DEFAULTS: FooterContent = {
  companyHeading: "কোম্পানি",
  contactHeading: "যোগাযোগ",
  quickLinksHeading: "কুইক লিংক",
  copyright: "© {year} {brand} Academy. সর্বস্বত্ব সংরক্ষিত।",
  madeInText: "Made with ❤️ in Bangladesh",
};

export const CONTENT_KEYS = {
  HOME: "home",
  FOOTER: "footer",
} as const;
