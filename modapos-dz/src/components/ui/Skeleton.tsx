import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("skeleton", className)} />;
}

export function SkeletonCard() {
  return (
    <div className="p-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4 flex-1"
          style={{ opacity: 1 - i * 0.1 }}
        />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-[var(--color-border)]">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} cols={cols} />
      ))}
    </div>
  );
}
