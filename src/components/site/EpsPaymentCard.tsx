import React from "react";

export function EpsPaymentCard({
  selected = true,
  onClick,
}: {
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border-2 transition-all p-3.5 sm:p-4 bg-white cursor-pointer ${
        selected
          ? "border-primary shadow-md ring-2 ring-primary/20"
          : "border-border hover:border-primary/50"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="font-bold text-sm text-foreground flex items-center gap-2">
          <input
            type="radio"
            checked={selected}
            readOnly
            className="h-4 w-4 text-primary accent-primary"
          />
          <span>Pay Online With EPS</span>
        </div>
        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-md border border-amber-200/80 shadow-2xs">
          Verified
        </span>
      </div>

      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
        bKash, Nagad, Rocket, Internet Banking বা Credit/Debit Card দিয়ে নিরাপদে পেমেন্ট করুন।
      </p>

      {/* Official EPS Payment Methods Banner */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-1 overflow-hidden shadow-2xs">
        <img
          src="/media/eps-banner.svg"
          alt="Pay with Visa, Mastercard, bKash, Nagad, Rocket, DBBL Nexus - Verified by EPS Easy Payment System"
          className="w-full h-auto object-contain"
          loading="lazy"
        />
      </div>
    </div>
  );
}
