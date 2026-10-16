import { cn } from "@/lib/utils";

/**
 * Small payment brand marks, drawn inline (no external logos, no requests).
 * Card and PayPal marks sit on a white chip so they keep their colours on
 * light and dark surfaces; mobile money networks are solid brand-colour
 * text badges.
 */

const chip = "inline-flex h-6 items-center justify-center rounded-[5px] border border-[#e4e0ec] bg-white px-1.5";

export function VisaMark({ className }: { className?: string }) {
  return (
    <span className={cn(chip, className)}>
      <svg viewBox="0 0 40 13" width="34" height="11" role="img" aria-label="Visa">
        <text
          x="20"
          y="11.2"
          textAnchor="middle"
          fill="#1A1F71"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="13.5"
          fontStyle="italic"
          fontWeight="900"
          letterSpacing="-0.3"
        >
          VISA
        </text>
      </svg>
    </span>
  );
}

export function MastercardMark({ className }: { className?: string }) {
  return (
    <span className={cn(chip, className)}>
      <svg viewBox="0 0 32 20" width="28" height="18" role="img" aria-label="Mastercard">
        <circle cx="12" cy="10" r="8" fill="#EB001B" />
        <circle cx="20" cy="10" r="8" fill="#F79E1B" />
        {/* The overlap of the two circles. */}
        <path d="M16 3.07A8 8 0 0 1 16 16.93A8 8 0 0 1 16 3.07Z" fill="#FF5F00" />
      </svg>
    </span>
  );
}

export function PayPalMark({ className }: { className?: string }) {
  return (
    <span className={cn(chip, "px-2", className)}>
      <svg viewBox="0 0 58 15" width="52" height="14" role="img" aria-label="PayPal">
        <text x="0" y="12" fontFamily="Verdana, Arial, Helvetica, sans-serif" fontSize="13" fontStyle="italic" fontWeight="800">
          <tspan fill="#003087">Pay</tspan>
          <tspan fill="#009CDE">Pal</tspan>
        </text>
      </svg>
    </span>
  );
}

const NETWORKS = [
  { key: "mpesa", label: "M-Pesa", className: "bg-[#E60000] text-white" },
  { key: "airtel", label: "Airtel Money", className: "bg-[#ED1C24] text-white" },
  { key: "mixx", label: "Mixx by Yas", className: "bg-[#FFD100] text-[#14123D]" },
  { key: "halopesa", label: "Halopesa", className: "bg-[#F37021] text-white" },
];

export function MobileMoneyMarks({ className }: { className?: string }) {
  return (
    <span className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {NETWORKS.map((n) => (
        <span
          key={n.key}
          className={cn("inline-flex h-6 items-center rounded-[5px] px-2 text-[0.6875rem] font-extrabold tracking-[0.01em]", n.className)}
        >
          {n.label}
        </span>
      ))}
    </span>
  );
}
