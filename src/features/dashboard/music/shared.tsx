import { useState } from "react";
import { Disc3 } from "lucide-react";
import type { Release } from "@/lib/api/types";
import { useCopy } from "@/lib/useCopy";
import { cn } from "@/lib/utils";
import { COPY } from "./copy";
import type { Issue } from "./wizard/validation";

/** Cover art with a neutral fallback tile (never a stock image). */
export function ReleaseCover({
  src,
  title,
  size = "md",
  className,
}: {
  src: string | null | undefined;
  title: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const c = useCopy(COPY);
  const [failed, setFailed] = useState(false);
  const dim = size === "sm" ? "h-12 w-12" : size === "md" ? "h-16 w-16" : "h-40 w-40 sm:h-48 sm:w-48";
  if (src && !failed) {
    return (
      <img
        src={src}
        alt={c.coverAlt(title)}
        loading="lazy"
        onError={() => setFailed(true)}
        className={cn(dim, "shrink-0 rounded-[10px] bg-surface-sunken object-cover", className)}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={c.noCover}
      className={cn(
        dim,
        "flex shrink-0 items-center justify-center rounded-[10px] border border-border-subtle bg-surface-sunken text-text-subtle",
        className,
      )}
    >
      <Disc3 className={size === "lg" ? "h-10 w-10" : "h-5 w-5"} aria-hidden />
    </span>
  );
}

const HIDDEN_LINK_STATES = new Set(["draft", "rejected", "taken_down"]);

/** Mirrors SmartLinkService::findPublic. */
export function isSmartLinkPublic(r: Pick<Release, "smart_link_enabled" | "status" | "slug">): boolean {
  return !!r.slug && r.smart_link_enabled && !HIDDEN_LINK_STATES.has(r.status);
}

export function smartLinkUrl(r: Pick<Release, "smart_link_url" | "slug">): string | null {
  if (r.smart_link_url) return r.smart_link_url;
  if (!r.slug) return null;
  return `${window.location.origin}/r/${r.slug}`;
}

/** Issue → translated message. */
export function useIssueText() {
  const c = useCopy(COPY);
  return (i: Issue | undefined | null) => (i ? c.issue[i.code](i.params ?? {}) : undefined);
}

export function formatDuration(ms: number | null | undefined): string {
  if (!ms || ms <= 0) return "—";
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let u = 0;
  while (v >= 1024 && u < units.length - 1) {
    v /= 1024;
    u += 1;
  }
  return `${v >= 10 || u === 0 ? Math.round(v) : v.toFixed(1)} ${units[u]}`;
}
