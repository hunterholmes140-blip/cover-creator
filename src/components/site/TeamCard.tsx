import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { QrCode, Mail, Phone, ArrowRight, ShieldCheck, X } from "lucide-react";
import { TeamMember, getDepartmentMeta } from "@/lib/team-types";
import { EmployeeQrCode } from "./EmployeeQrCode";

export function TeamCard({ member }: { member: TeamMember }) {
  const [showQrModal, setShowQrModal] = useState(false);
  const deptMeta = getDepartmentMeta(member.department);
  const profileKey = member.employee_id || member.slug || String(member.id);

  return (
    <>
      <div className="group relative rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden">
        {/* Subtle top gradient accent */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${deptMeta.gradient}`} />

        <div>
          {/* Header with Department Badge & Employee ID */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${deptMeta.badgeColor}`}
            >
              {member.department}
            </span>

            {member.employee_id && (
              <span className="font-mono text-xs font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/60">
                {member.employee_id}
              </span>
            )}
          </div>

          {/* Avatar & Info */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="h-24 w-24 rounded-full overflow-hidden ring-4 ring-background shadow-md bg-muted">
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={member.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full grid place-items-center bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-2xl font-bold">
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>
              <div
                className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-white dark:bg-slate-900 border border-border shadow-sm grid place-items-center text-emerald-600"
                title="ভেরিফায়েড টিম মেম্বার"
              >
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>

            <h3
              className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1"
              style={{ fontFamily: '"Hind Siliguri", var(--font-sans)' }}
            >
              {member.name}
            </h3>

            <p className="text-sm font-medium text-primary/80 mt-0.5 line-clamp-1">
              {member.designation}
            </p>

            {member.bio && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                {member.bio}
              </p>
            )}
          </div>

          {/* Contact snippets if available & visible */}
          {((member.visibility?.email !== false && member.email) ||
            (member.visibility?.phone !== false && member.phone)) && (
            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              {member.visibility?.email !== false && member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                  title={member.email}
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[120px]">{member.email}</span>
                </a>
              )}
              {member.visibility?.phone !== false && member.phone && (
                <a
                  href={`tel:${member.phone}`}
                  className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                  title={member.phone}
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[110px]">{member.phone}</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="QR কোড দেখুন"
          >
            <QrCode className="h-3.5 w-3.5 text-primary" />
            <span>QR কোড</span>
          </button>

          <Link
            to="/team/$id"
            params={{ id: profileKey }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors group-hover:translate-x-0.5"
          >
            প্রোফাইল দেখুন
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* QR Code Quick Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-muted-foreground hover:bg-muted transition-colors"
              aria-label="বন্ধ করুন"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <h3 className="text-base font-bold text-foreground">{member.name}</h3>
              <p className="text-xs text-muted-foreground">
                {member.designation} • {member.department}
              </p>
            </div>

            <EmployeeQrCode member={member} size={190} showCard={false} showActions={true} />

            <div className="pt-2 text-center">
              <Link
                to="/team/$id"
                params={{ id: profileKey }}
                onClick={() => setShowQrModal(false)}
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                সম্পূর্ণ প্রোফাইল পেজে যান
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
