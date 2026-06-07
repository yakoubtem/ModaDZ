// ─── Currency Formatter (DZD) ─────────────────────────────
const getLang = () => (typeof document !== "undefined" ? document.documentElement.lang : "fr") || "fr";

export function formatCurrency(amount: number): string {
  const lang = getLang() === "ar" ? "ar-DZ" : "fr-DZ";
  return new Intl.NumberFormat(lang, {
    style: "currency",
    currency: "DZD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ─── Payment Status ────────────────────────────────────────
export type PaymentStatus = "paid" | "partial" | "unpaid";

export function getPaymentStatus(
  amountPaid: number,
  total: number
): PaymentStatus {
  if (amountPaid >= total) return "paid";
  if (amountPaid > 0) return "partial";
  return "unpaid";
}

// ─── Date Formatters ──────────────────────────────────────
export function formatDate(dateStr: string): string {
  const lang = getLang() === "ar" ? "ar-DZ" : "fr-DZ";
  return new Intl.DateTimeFormat(lang, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateStr));
}

export function formatDateTime(dateStr: string): string {
  const lang = getLang() === "ar" ? "ar-DZ" : "fr-DZ";
  return new Intl.DateTimeFormat(lang, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  const isAr = getLang() === "ar";

  if (minutes < 1) return isAr ? "الآن" : "À l'instant";
  if (minutes < 60) return isAr ? `منذ ${minutes} د` : `Il y a ${minutes}min`;
  if (hours < 24) return isAr ? `منذ ${hours} سا` : `Il y a ${hours}h`;
  if (days < 7) return isAr ? `منذ ${days} ي` : `Il y a ${days}j`;
  return formatDate(dateStr);
}

// ─── Class Name Helper ────────────────────────────────────
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ─── String Utilities ─────────────────────────────────────
export function truncate(str: string, length = 30): string {
  return str.length > length ? str.slice(0, length) + "…" : str;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// ─── Number Utilities ─────────────────────────────────────
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function pct(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// ─── SKU Generator ────────────────────────────────────────
export function generateSku(productName: string): string {
  const prefix = productName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 3)
    .padEnd(3, "X");
  const suffix = Math.floor(Math.random() * 90000 + 10000);
  return `${prefix}-${suffix}`;
}
