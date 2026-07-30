import nodemailer from "nodemailer";
import { qOne } from "@/lib/db.server";

export type EmailTemplateKey = "payment_success" | "payment_failed" | "order_pending";

export const DEFAULT_EMAIL_TEMPLATES: Record<
  EmailTemplateKey,
  { subject: string; title: string; body: string; button_text: string }
> = {
  payment_success: {
    subject: "🎓 অভিনন্দন! আপনার {{course_title}} কোর্সে ভর্তি সফল হয়েছে - Vencon Academy",
    title: "ধন্যবাদ! আপনার এনরোলমেন্ট সফল হয়েছে 🎉",
    body: `প্রিয় {{user_name}},

আপনার পেমেন্ট (৳{{amount}}) সফলভাবে গৃহীত হয়েছে এবং <strong>{{course_title}}</strong> কোর্সে আপনার ভর্তি নিশ্চিত করা হয়েছে।

<strong>অর্ডারের বিবরণ:</strong>
• ট্রানজেকশন আইডি: {{transaction_id}}
• কোর্সের নাম: {{course_title}}
• পরিশোধিত মূল্য: ৳{{amount}}

এখনই আপনার সিক্রেট লার্নিং গ্রুপে যুক্ত হন এবং ড্যাশবোর্ড থেকে ক্লাস শুরু করুন।`,
    button_text: "ড্যাশবোর্ডে যান",
  },

  payment_failed: {
    subject: "⚠️ আপনার {{course_title}} কোর্সের পেমেন্ট ব্যর্থ হয়েছে - Vencon Academy",
    title: "পেমেন্ট ব্যর্থ হয়েছে ⚠️",
    body: `প্রিয় {{user_name}},

আপনার <strong>{{course_title}}</strong> কোর্সের পেমেন্ট সম্পূর্ণ করা সম্ভব হয়নি বা বাতিল করা হয়েছে। 

যদি আপনার একাউন্ট থেকে টাকা কেটে নেওয়া হয়ে থাকে অথবা অন্য কোনো পেমেন্ট সমস্যা হয়, তবে অনুগ্রহ করে আমাদের সাপোর্ট টিমে যোগাযোগ করুন অথবা পুনরায় চেষ্টা করুন।`,
    button_text: "পুনরায় পেমেন্ট চেষ্টা করুন",
  },

  order_pending: {
    subject: "📋 আপনার {{course_title}} কোর্সের ম্যানুয়াল অর্ডার পাওয়া গেছে - Vencon Academy",
    title: "অর্ডার পর্যালোচনায় রয়েছে ⏳",
    body: `প্রিয় {{user_name}},

আপনার ম্যানুয়াল পেমেন্ট অর্ডারের তথ্য পাওয়া গেছে। আমাদের এডমিন টিম আপনার ট্রানজেকশন আইডি ({{transaction_id}}) ও তথ্য যাচাই করে খুব শীঘ্রই কোর্স এক্সেস অনুমোদন (Approve) করবেন।

অ্যাপ্রুভ হওয়ার সাথে সাথে আপনার ড্যাশবোর্ডে কোর্স শো করবে।`,
    button_text: "ড্যাশবোর্ডে অর্ডারের অবস্থা দেখুন",
  },
};

/** Load active SMTP config from env or database */
export async function getSmtpConfig() {
  let config = {
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port: Number(process.env.SMTP_PORT || 465),
    user: process.env.SMTP_USER || "support@vencon.com.bd",
    pass: process.env.SMTP_PASS || "Foyej2022@",
    from_email: process.env.FROM_EMAIL || process.env.SMTP_USER || "support@vencon.com.bd",
    from_name: process.env.FROM_NAME || "Vencon Academy",
  };

  try {
    const row = await qOne<any>(`SELECT content_json FROM site_content WHERE content_key = 'email_settings' LIMIT 1`);
    if (row?.content_json) {
      const dbCfg = JSON.parse(row.content_json);
      if (dbCfg.host) config.host = dbCfg.host;
      if (dbCfg.port) config.port = Number(dbCfg.port);
      if (dbCfg.user) config.user = dbCfg.user;
      if (dbCfg.pass) config.pass = dbCfg.pass;
      if (dbCfg.from_name) config.from_name = dbCfg.from_name;
    }
  } catch (err) {
    console.error("[Email] DB SMTP config load error:", err);
  }

  return config;
}

/** Load custom email templates from database or fallback to defaults */
export async function getEmailTemplates(): Promise<Record<EmailTemplateKey, { subject: string; title: string; body: string; button_text: string }>> {
  try {
    const row = await qOne<any>(`SELECT content_json FROM site_content WHERE content_key = 'email_templates' LIMIT 1`);
    if (row?.content_json) {
      return { ...DEFAULT_EMAIL_TEMPLATES, ...JSON.parse(row.content_json) };
    }
  } catch {}
  return DEFAULT_EMAIL_TEMPLATES;
}

/** Send an email using Nodemailer and Hostinger SMTP */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  if (!to || !to.includes("@")) return false;

  try {
    const cfg = await getSmtpConfig();
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.port === 465, // true for 465, false for 587
      auth: {
        user: cfg.user,
        pass: cfg.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `"${cfg.from_name}" <${cfg.from_email}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ""),
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Sent] MessageID: ${info.messageId} to ${to}`);
    return true;
  } catch (err) {
    console.error("[Email Send Error]:", err);
    return false;
  }
}

/** Helper to render branded HTML email from template key & variables */
export async function sendTemplatedEmail(
  templateKey: EmailTemplateKey,
  toEmail: string,
  vars: Record<string, string | number>
) {
  if (!toEmail) return false;

  const templates = await getEmailTemplates();
  const template = templates[templateKey] || DEFAULT_EMAIL_TEMPLATES[templateKey];

  let subject = template.subject;
  let title = template.title;
  let body = template.body;
  let buttonText = template.button_text;

  // Replace variables like {{user_name}}, {{course_title}}, {{amount}}
  Object.entries(vars).forEach(([k, v]) => {
    const val = String(v ?? "");
    const regex = new RegExp(`{{\\s*${k}\\s*}}`, "g");
    subject = subject.replace(regex, val);
    title = title.replace(regex, val);
    body = body.replace(regex, val);
    buttonText = buttonText.replace(regex, val);
  });

  const formattedBody = body.replace(/\n/g, "<br/>");
  const dashboardUrl = String(vars.dashboard_url || "https://vencon.com.bd/dashboard");

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; color: #333333; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px 20px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .content { padding: 32px 28px; line-height: 1.7; font-size: 15px; }
    .content strong { color: #0f172a; }
    .btn-container { text-align: center; margin: 30px 0 10px 0; }
    .btn { display: inline-block; background: #f97316; color: #ffffff !important; font-weight: 700; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-size: 16px; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.35); }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; }
    .footer a { color: #ea580c; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Vencon Academy</h1>
    </div>
    <div class="content">
      <h2 style="color: #0f172a; margin-top: 0;">${title}</h2>
      <div>${formattedBody}</div>
      <div class="btn-container">
        <a href="${dashboardUrl}" class="btn" target="_blank">${buttonText} →</a>
      </div>
    </div>
    <div class="footer">
      <p>© 2026 Vencon Academy. সর্বস্বত্ব সংরক্ষিত।</p>
      <p><a href="https://vencon.com.bd">vencon.com.bd</a> | সাপোর্ট: support@vencon.com.bd</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({ to: toEmail, subject, html: htmlContent });
}
