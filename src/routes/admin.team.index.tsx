import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, QrCode, Search, Filter, ShieldCheck, X, Eye } from "lucide-react";
import { useTeam } from "@/lib/admin-store";
import { TEAM_DEPARTMENTS, TeamMember, getDepartmentMeta, getEffectiveVerificationStatus } from "@/lib/team-types";
import { PageHeader, Card, Button, ConfirmDialog, useToast, Empty, Badge } from "@/components/admin/ui";
import { EmployeeQrCode } from "@/components/site/EmployeeQrCode";

export const Route = createFileRoute("/admin/team/")({
  component: AdminTeamList,
});

function AdminTeamList() {
  const { items, remove, saveNow } = useTeam();
  const toast = useToast();
  const [confirmId, setConfirmId] = useState<any>(null);
  const [activeDept, setActiveDept] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQrMember, setSelectedQrMember] = useState<TeamMember | null>(null);

  const filtered = useMemo(() => {
    return items.filter((m: TeamMember) => {
      if (activeDept !== "all") {
        if ((m.department || "").toLowerCase() !== activeDept.toLowerCase()) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const n = (m.name || "").toLowerCase();
        const id = (m.employee_id || "").toLowerCase();
        const d = (m.designation || "").toLowerCase();
        const p = (m.phone || "").toLowerCase();
        return n.includes(q) || id.includes(q) || d.includes(q) || p.includes(q);
      }
      return true;
    });
  }, [items, activeDept, searchQuery]);

  const handleDelete = async (id: any) => {
    remove(id);
    await saveNow();
    setConfirmId(null);
    toast.show("এমপ্লয়ী মুছে ফেলা হয়েছে");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="টিম ও এমপ্লয়ী ম্যানেজমেন্ট"
        subtitle={`মোট ${items.length} জন কর্মকর্তা ও কর্মচারী। এখান থেকে কর্মী যুক্ত, তথ্য সম্পাদনা ও কিউআর কোড ডাউনলোড করুন।`}
        actions={
          <Link to="/admin/team/new">
            <Button>
              <Plus className="h-4 w-4" /> নতুন এমপ্লয়ী যোগ করুন
            </Button>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নাম, পদবী বা আইডি দিয়ে খুঁজুন..."
              className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setActiveDept("all")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                activeDept === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              সকল ({items.length})
            </button>
            {TEAM_DEPARTMENTS.map((d) => (
              <button
                key={d.value}
                onClick={() => setActiveDept(d.value)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  activeDept.toLowerCase() === d.value.toLowerCase()
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* List */}
      {filtered.length === 0 ? (
        <Empty title="কোনো এমপ্লয়ী পাওয়া যায়নি।" />
      ) : (
        <div className="space-y-3">
          {filtered.map((member: TeamMember) => {
            const deptMeta = getDepartmentMeta(member.department);
            const profileKey = member.employee_id || member.slug || String(member.id);

            return (
              <Card key={member.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Avatar and Info */}
                  <div className="flex items-center gap-3.5">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-muted flex-shrink-0 ring-2 ring-border">
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full grid place-items-center font-bold text-muted-foreground text-sm">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-foreground text-sm sm:text-base">
                          {member.name}
                        </h4>
                        {member.employee_id && (
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                            ID: {member.employee_id}
                          </span>
                        )}
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${deptMeta.badgeColor}`}>
                          {member.department}
                        </span>
                        {(() => {
                          const eff = getEffectiveVerificationStatus(member);
                          return (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${eff.badgeColor}`}>
                              {eff.status}
                            </span>
                          );
                        })()}
                      </div>

                      <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-medium text-foreground/80">{member.designation}</span>
                        {member.id_card_number && <span className="font-mono">Card: {member.id_card_number}</span>}
                        {member.employment_type && <span>• {member.employment_type}</span>}
                        {member.phone && <span>• {member.phone}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                    {/* View QR Code Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedQrMember(member)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border bg-background hover:bg-accent text-foreground transition-colors shadow-sm"
                      title="QR কোড দেখুন ও ডাউনলোড করুন"
                    >
                      <QrCode className="h-3.5 w-3.5 text-primary" />
                      <span>QR কোড</span>
                    </button>

                    {/* View Public Profile Link */}
                    <Link
                      to="/team/$id"
                      params={{ id: profileKey }}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                      title="পাবলিক প্রোফাইল দেখুন"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Link>

                    {/* Edit Button */}
                    <Link to={`/admin/team/${member.id}` as any}>
                      <button
                        type="button"
                        className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                        title="তথ্য এডিট করুন"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </Link>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => setConfirmId(member.id)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* QR Code Modal */}
      {selectedQrMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setSelectedQrMember(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-muted-foreground hover:bg-muted transition-colors"
              aria-label="বন্ধ করুন"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <h3 className="text-base font-bold text-foreground">
                {selectedQrMember.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {selectedQrMember.designation} • {selectedQrMember.department}
              </p>
              {selectedQrMember.employee_id && (
                <div className="mt-1 font-mono text-xs font-bold text-primary">
                  ID: {selectedQrMember.employee_id}
                </div>
              )}
            </div>

            <EmployeeQrCode
              member={selectedQrMember}
              size={200}
              showCard={false}
              showActions={true}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={() => handleDelete(confirmId)}
        title="এমপ্লয়ী মুছে ফেলবেন?"
        description="এই কর্মীর তথ্য স্থায়ীভাবে মুছে যাবে। আপনি কি নিশ্চিত?"
      />
    </div>
  );
}
