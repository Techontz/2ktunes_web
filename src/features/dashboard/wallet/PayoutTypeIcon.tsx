import { Globe2, Landmark, Smartphone, Wallet } from "lucide-react";

/** Icon for a payout method type (mobile money, bank, SWIFT, wallet). */
export function PayoutTypeIcon({ type, className }: { type: string | null | undefined; className?: string }) {
  switch (type) {
    case "bank":
      return <Landmark className={className} aria-hidden />;
    case "bank_international":
      return <Globe2 className={className} aria-hidden />;
    case "wallet":
      return <Wallet className={className} aria-hidden />;
    default:
      return <Smartphone className={className} aria-hidden />;
  }
}
