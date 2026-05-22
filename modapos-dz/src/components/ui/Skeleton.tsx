import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// ─── Base Skeleton ──────────────────────────────────────────────────────────
type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div className={cn("skeleton", className)} {...props} />;
}

// ─── Stat Card (Dashboard KPIs) ─────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="p-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

// ─── Table Row ──────────────────────────────────────────────────────────────
export function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4 flex-1"
          style={{ opacity: Math.max(0.3, 1 - i * 0.12) }}
        />
      ))}
    </div>
  );
}

// ─── Full Table (header + rows) ─────────────────────────────────────────────
export function SkeletonTable({
  rows = 6,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="divide-y divide-[var(--color-border)]">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} cols={cols} />
      ))}
    </div>
  );
}

// ─── Page Header ────────────────────────────────────────────────────────────
export function SkeletonPageHeader() {
  return (
    <div className="flex items-center justify-between gap-4 px-8 py-6 border-b border-[var(--color-border)] shrink-0">
      <div className="space-y-2">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-9 w-32 rounded-[var(--radius-md)]" />
    </div>
  );
}

// ─── Form Section (settings-style card with 2-col grid) ─────────────────────
export function SkeletonFormSection({ fields = 4 }: { fields?: number }) {
  return (
    <div className="bg-[var(--color-bg-elevated)] p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] space-y-4">
      <Skeleton className="h-5 w-40" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-9 w-full rounded-[var(--radius-md)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Receipt Preview Loading ─────────────────────────────────────────────────
export function SkeletonReceiptPreview() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5 space-y-4 font-mono text-xs">
      {/* Store header */}
      <div className="flex flex-col items-center gap-1.5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-36" />
      </div>
      <div className="border-t border-dashed border-[var(--color-border)]" />
      {/* Items */}
      <div className="space-y-2.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between gap-2">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3.5 w-16" />
            </div>
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="border-t border-dashed border-[var(--color-border)]" />
      {/* Totals */}
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-16" />
          </div>
        ))}
        <div className="flex justify-between pt-1 border-t border-[var(--color-border)]">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}
