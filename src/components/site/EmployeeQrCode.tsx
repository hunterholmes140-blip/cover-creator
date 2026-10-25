import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, QrCode, Check, Copy, ExternalLink, Printer } from "lucide-react";
import { getProfileUrl } from "@/lib/team-types";

interface EmployeeQrCodeProps {
  member: {
    id: any;
    employee_id?: string;
    slug?: string;
    name: string;
    department?: string;
    designation?: string;
    avatar_url?: string;
  };
  size?: number;
  showCard?: boolean;
  showActions?: boolean;
}

export function EmployeeQrCode({
  member,
  size = 180,
  showCard = true,
  showActions = true,
}: EmployeeQrCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const profileUrl = getProfileUrl(member);

  const downloadQr = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;

    // Create a branded canvas with employee details and white margin
    const padding = 24;
    const headerHeight = 50;
    const footerHeight = 40;
    const totalWidth = canvas.width + padding * 2;
    const totalHeight = canvas.height + padding * 2 + headerHeight + footerHeight;

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = totalWidth;
    exportCanvas.height = totalHeight;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.roundRect ? ctx.roundRect(0, 0, totalWidth, totalHeight, 16) : ctx.fillRect(0, 0, totalWidth, totalHeight);
    ctx.fill();

    // Border
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Header: Company Name & Member Name
    const company = (member as any).company_name || "Vencon";
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(member.name || `${company} Team Member`, totalWidth / 2, padding + 18);

    ctx.fillStyle = "#64748b";
    ctx.font = "12px sans-serif";
    const idLabel = member.employee_id ? `ID: ${member.employee_id} • ${company}` : (member.designation || company);
    ctx.fillText(idLabel, totalWidth / 2, padding + 36);

    // Draw QR code
    ctx.drawImage(canvas, padding, padding + headerHeight);

    // Footer: Instruction
    ctx.fillStyle = "#0284c7";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("SCAN TO VERIFY PROFILE", totalWidth / 2, totalHeight - padding);

    // Download as image
    const link = document.createElement("a");
    const safeName = (member.employee_id || member.name || "qr-code")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "_");
    link.download = `vencon-qr-${safeName}.png`;
    link.href = exportCanvas.toDataURL("image/png");
    link.click();
  };

  const copyUrl = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const printQr = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const canvas = qrRef.current?.querySelector("canvas");
    const dataUrl = canvas ? canvas.toDataURL("image/png") : "";
    const company = (member as any).company_name || "Vencon";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${member.name} - ${company} Official QR Card</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 90vh; margin: 0; background: #f8fafc; }
            .card { background: white; border: 2px solid #cbd5e1; border-radius: 16px; padding: 28px; text-align: center; max-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
            h2 { margin: 0 0 4px; font-size: 18px; color: #0f172a; }
            p.sub { margin: 0 0 16px; font-size: 13px; color: #64748b; }
            .badge { display: inline-block; background: #e0f2fe; color: #0284c7; padding: 4px 12px; border-radius: 9999px; font-weight: bold; font-size: 12px; margin-bottom: 16px; }
            img { display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #e2e8f0; }
            .footer { margin-top: 16px; font-size: 11px; color: #94a3b8; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>${member.name}</h2>
            <p class="sub">${member.designation || member.department || ""} • ${company}</p>
            ${member.employee_id ? `<div class="badge">ID: ${member.employee_id}</div>` : ""}
            <img src="${dataUrl}" width="${size}" height="${size}" alt="QR Code" />
            <div class="footer">${company} Official Verification Card</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const content = (
    <div className="flex flex-col items-center text-center">
      <div
        ref={qrRef}
        className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 inline-block"
      >
        <QRCodeCanvas
          value={profileUrl}
          size={size}
          level="H"
          includeMargin={true}
        />
      </div>

      <div className="mt-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
          <QrCode className="h-3.5 w-3.5" />
          <span>স্ক্যান করে প্রোফাইল দেখুন</span>
        </div>
        {member.employee_id && (
          <div className="text-[11px] font-mono font-medium text-muted-foreground mt-0.5">
            ID: {member.employee_id}
          </div>
        )}
      </div>

      {showActions && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={downloadQr}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            title="QR কোড ইমেজ ডাউনলোড করুন"
          >
            <Download className="h-3.5 w-3.5" />
            QR ডাউনলোড
          </button>

          <button
            type="button"
            onClick={copyUrl}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-background hover:bg-accent text-foreground transition-colors"
            title="প্রোফাইল লিংক কপি করুন"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-600" />
                কপি হয়েছে
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                লিংক কপি
              </>
            )}
          </button>

          <button
            type="button"
            onClick={printQr}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="আইডি কার্ড QR প্রিন্ট করুন"
          >
            <Printer className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );

  if (!showCard) {
    return content;
  }

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-5 shadow-sm">
      {content}
    </div>
  );
}
