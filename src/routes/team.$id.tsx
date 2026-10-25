import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ArrowLeft,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Heart,
  Briefcase,
  Share2,
  ExternalLink,
  Facebook,
  Linkedin,
  Twitter,
  Github,
  Globe,
} from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { useTeam } from "@/lib/admin-store";
import { getDepartmentMeta, TeamMember } from "@/lib/team-types";
import { EmployeeQrCode } from "@/components/site/EmployeeQrCode";

export const Route = createFileRoute("/team/$id")({
  head: () => ({
    meta: [
      { title: "টিম মেম্বার প্রোফাইল — NextScale Academy" },
      { name: "description", content: "কর্মকর্তার অফিশিয়াল প্রোফাইল ও পরিচিতি।" },
    ],
  }),
  component: TeamMemberProfilePage,
});

function TeamMemberProfilePage() {
  const { id } = useParams({ from: "/team/$id" });
  const { items } = useTeam();

  const member = useMemo(() => {
    if (!items || !id) return null;
    const target = decodeURIComponent(id).trim().toLowerCase();
    return items.find((m: TeamMember) => {
      const empId = (m.employee_id || "").trim().toLowerCase();
      const slug = (m.slug || "").trim().toLowerCase();
      const mid = String(m.id || "").trim().toLowerCase();
      return empId === target || slug === target || mid === target;
    });
  }, [items, id]);

  if (!member) {
    return (
      <SiteLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
          <div className="h-16 w-16 rounded-full bg-destructive/10 text-destructive grid place-items-center mb-4">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">টিম মেম্বার পাওয়া যায়নি</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            আপনি যে এমপ্লয়ী আইডি বা প্রোফাইল খুঁজছেন তা খুঁজে পাওয়া যায়নি অথবা মুছে ফেলা হয়েছে।
          </p>
          <Link
            to="/team"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            টিম লিস্টে ফিরে যান
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const deptMeta = getDepartmentMeta(member.department);

  return (
    <SiteLayout>
      <div className="min-h-screen bg-muted/20 pb-24">
        {/* Top Navigation Bar */}
        <div className="border-b border-border bg-background/80 backdrop-blur sticky top-16 z-30">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
            <Link
              to="/team"
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>টিম ডিরেক্টরিতে ফিরে যান</span>
            </Link>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="hidden sm:inline">ডিপার্টমেন্ট:</span>
              <span className={`px-2.5 py-0.5 rounded-full font-semibold border ${deptMeta.badgeColor}`}>
                {member.department}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Container */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Official Digital ID Card with QR Code */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl border-2 border-border bg-card shadow-xl overflow-hidden relative">
                {/* Header ribbon */}
                <div className={`h-24 bg-gradient-to-r ${deptMeta.gradient} p-4 flex items-start justify-between text-white`}>
                  <div>
                    <div className="text-[10px] font-bold tracking-widest uppercase opacity-80">
                      NextScale Academy
                    </div>
                    <div className="text-sm font-extrabold tracking-tight">
                      OFFICIAL EMPLOYEE ID
                    </div>
                  </div>
                  <ShieldCheck className="h-7 w-7 text-white/90" />
                </div>

                {/* Avatar with overlap */}
                <div className="px-6 -mt-12 text-center flex flex-col items-center">
                  <div className="relative">
                    <div className="h-28 w-28 rounded-full overflow-hidden ring-4 ring-card shadow-xl bg-muted">
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full grid place-items-center bg-gradient-to-br from-primary/30 to-primary/10 text-primary text-3xl font-extrabold">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div
                      className="absolute bottom-1 right-1 h-7 w-7 rounded-full bg-emerald-500 text-white grid place-items-center ring-2 ring-card shadow"
                      title="অ্যাক্টিভ ও ভেরিফায়েড"
                    >
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                  </div>

                  <h1
                    className="text-2xl font-extrabold text-foreground mt-3"
                    style={{ fontFamily: '"Hind Siliguri", var(--font-sans)' }}
                  >
                    {member.name}
                  </h1>

                  <p className="text-sm font-semibold text-primary mt-0.5">
                    {member.designation}
                  </p>

                  {member.employee_id && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted text-xs font-mono font-bold text-foreground border border-border">
                      <span className="text-muted-foreground text-[10px]">ID:</span>
                      <span>{member.employee_id}</span>
                    </div>
                  )}
                </div>

                {/* Integrated Scannable QR Code */}
                <div className="p-6 pt-4 border-t border-border mt-4 bg-muted/20">
                  <EmployeeQrCode member={member} size={170} showCard={false} showActions={true} />
                </div>
              </div>
            </div>

            {/* Right Column: Full Particulars, Bio & Official Info */}
            <div className="lg:col-span-7 space-y-6">
              {/* Verification Header Banner */}
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex-shrink-0 grid place-items-center">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    ভেরিফায়েড ও অনুমোদিত কর্মকর্তা প্রোফাইল
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    এই কর্মকর্তা NextScale Academy-এর একজন অফিশিয়াল কর্মী। কিউআর কোড স্ক্যান করে আপনি তার ডিজিটাল পরিচিতি ও ডিপার্টমেন্টের অনুমোদন নিশ্চিত করতে পারেন।
                  </p>
                </div>
              </div>

              {/* Bio Section */}
              {member.bio && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-2">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                    পরিচিতি ও দায়িত্ব
                  </h3>
                  <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                    {member.bio}
                  </p>
                </div>
              )}

              {/* Official Particulars Grid */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                  অফিশিয়াল বিবরণ
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {/* Department */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center flex-shrink-0">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-muted-foreground font-medium">ডিপার্টমেন্ট</div>
                      <div className="font-semibold text-foreground">{member.department}</div>
                    </div>
                  </div>

                  {/* Employee ID */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                    <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-600 grid place-items-center flex-shrink-0 font-mono font-bold text-xs">
                      ID
                    </div>
                    <div>
                      <div className="text-[11px] text-muted-foreground font-medium">অফিশিয়াল এমপ্লয়ী আইডি</div>
                      <div className="font-mono font-bold text-foreground">{member.employee_id || "N/A"}</div>
                    </div>
                  </div>

                  {/* Joining Date */}
                  {member.joining_date && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                      <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-600 grid place-items-center flex-shrink-0">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground font-medium">যোগদানের তারিখ</div>
                        <div className="font-semibold text-foreground">{member.joining_date}</div>
                      </div>
                    </div>
                  )}

                  {/* Blood Group */}
                  {member.blood_group && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                      <div className="h-9 w-9 rounded-lg bg-rose-500/10 text-rose-600 grid place-items-center flex-shrink-0">
                        <Heart className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground font-medium">রক্তের গ্রুপ</div>
                        <div className="font-bold text-rose-600">{member.blood_group}</div>
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  {member.location && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                      <div className="h-9 w-9 rounded-lg bg-indigo-500/10 text-indigo-600 grid place-items-center flex-shrink-0">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground font-medium">কর্মস্থল / অফিস</div>
                        <div className="font-semibold text-foreground">{member.location}</div>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {member.email && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                      <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 grid place-items-center flex-shrink-0">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-[11px] text-muted-foreground font-medium">অফিশিয়াল ইমেইল</div>
                        <a
                          href={`mailto:${member.email}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors truncate block"
                        >
                          {member.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  {member.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                      <div className="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-600 grid place-items-center flex-shrink-0">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground font-medium">যোগাযোগ নম্বর</div>
                        <a
                          href={`tel:${member.phone}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          {member.phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Links */}
              {member.social && Object.values(member.social).some(Boolean) && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                    সামাজিক মাধ্যম ও সংযোগ
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {member.social.facebook && (
                      <a
                        href={member.social.facebook}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 transition-colors"
                      >
                        <Facebook className="h-4 w-4" />
                        <span>Facebook</span>
                      </a>
                    )}
                    {member.social.linkedin && (
                      <a
                        href={member.social.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 transition-colors"
                      >
                        <Linkedin className="h-4 w-4" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {member.social.twitter && (
                      <a
                        href={member.social.twitter}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 transition-colors"
                      >
                        <Twitter className="h-4 w-4" />
                        <span>Twitter / X</span>
                      </a>
                    )}
                    {member.social.github && (
                      <a
                        href={member.social.github}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/10 text-slate-800 dark:text-slate-200 hover:bg-slate-800/20 transition-colors"
                      >
                        <Github className="h-4 w-4" />
                        <span>GitHub</span>
                      </a>
                    )}
                    {member.social.website && (
                      <a
                        href={member.social.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        <span>Website</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
