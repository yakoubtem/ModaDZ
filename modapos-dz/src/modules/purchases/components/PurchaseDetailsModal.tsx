import type { Purchase } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { Printer } from "lucide-react";
import { PaymentStatusBadge } from "@/components/ui/PaymentStatusBadge";

interface PurchaseDetailsModalProps {
  isOpen: boolean;
  purchase: Purchase | null;
  onClose: () => void;
}

export function PurchaseDetailsModal({
  isOpen,
  purchase,
  onClose,
}: PurchaseDetailsModalProps) {
  const { t, isRtl } = useTranslation();

  if (!purchase) return null;

  const remainingDebt = Math.max(0, purchase.total - purchase.amountPaid);

  const handlePrint = () => {
    // Basic print view by temporarily isolating the purchase details layout or just triggering window.print()
    window.print();
  };

  const footer = (
    <div style={{ display: "flex", gap: "10px", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
      <button onClick={handlePrint} className="btn-border" style={{ gap: 6 }}>
        <Printer style={{ width: 16, height: 16 }} />
        Imprimer / PDF
      </button>
      <button onClick={onClose} className="btn-primary">
        Fermer
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("purchases.purchase_details") || "Détails de l'achat"}
      footer={footer}
      size="lg"
      scrollable
    >
      <div
        id="purchase-details-print"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          direction: isRtl ? "rtl" : "ltr",
        }}
      >
        {/* Header summary */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "16px",
            borderBottom: "1px solid rgba(208, 197, 175, 0.25)",
          }}
        >
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-on-surface)" }}>
              {purchase.reference}
            </h3>
            <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)", marginTop: "4px" }}>
              {formatDate(purchase.createdAt)}
            </p>
          </div>
          <div>
            <PaymentStatusBadge amountPaid={purchase.amountPaid} total={purchase.total} />
          </div>
        </div>

        {/* Supplier and General Info */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
          }}
        >
          <div>
            <h4
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-outline)",
                marginBottom: "8px",
              }}
            >
              {t("purchases.table.supplier") || "Fournisseur"}
            </h4>
            <p style={{ fontWeight: 600, color: "var(--color-on-surface)" }}>
              {purchase.supplier?.name}
            </p>
            {purchase.supplier?.phone && (
              <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)", marginTop: "4px" }}>
                Tel: {purchase.supplier.phone}
              </p>
            )}
            {purchase.supplier?.email && (
              <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)", marginTop: "2px" }}>
                Email: {purchase.supplier.email}
              </p>
            )}
            {purchase.supplier?.address && (
              <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)", marginTop: "2px" }}>
                Adresse: {purchase.supplier.address}
              </p>
            )}
          </div>
          <div>
            <h4
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-outline)",
                marginBottom: "8px",
              }}
            >
              Notes
            </h4>
            <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-on-surface)", fontStyle: "italic" }}>
              {purchase.notes || "Aucune note."}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div>
          <h4
            style={{
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--color-outline)",
              marginBottom: "12px",
            }}
          >
            {t("purchases.form.items_list") || "Articles de la commande"}
          </h4>
          <div style={{ border: "1px solid rgba(208, 197, 175, 0.25)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-body-sm)" }}>
              <thead>
                <tr style={{ background: "rgba(245, 243, 238, 0.5)", borderBottom: "1px solid rgba(208, 197, 175, 0.2)" }}>
                  <th style={{ padding: "10px 16px", textAlign: isRtl ? "right" : "left", color: "var(--color-secondary)", fontSize: "11px", fontWeight: 600 }}>
                    Produit
                  </th>
                  <th style={{ padding: "10px 16px", textAlign: isRtl ? "right" : "left", color: "var(--color-secondary)", fontSize: "11px", fontWeight: 600 }}>
                    Taille / Couleur
                  </th>
                  <th style={{ padding: "10px 16px", textAlign: "right", color: "var(--color-secondary)", fontSize: "11px", fontWeight: 600 }}>
                    P.U.
                  </th>
                  <th style={{ padding: "10px 16px", textAlign: "right", color: "var(--color-secondary)", fontSize: "11px", fontWeight: 600 }}>
                    Qté
                  </th>
                  <th style={{ padding: "10px 16px", textAlign: "right", color: "var(--color-secondary)", fontSize: "11px", fontWeight: 600 }}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {purchase.items?.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid rgba(208, 197, 175, 0.15)" }}>
                    <td style={{ padding: "10px 16px", color: "var(--color-on-surface)", fontWeight: 500 }}>
                      {item.product?.name || `Produit #${item.productId}`}
                    </td>
                    <td style={{ padding: "10px 16px", color: "var(--color-secondary)" }}>
                      {item.variant ? `${item.variant.size} / ${item.variant.color}` : "—"}
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                      {formatCurrency(item.costPrice)}
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600, color: "var(--color-on-surface)", fontVariantNumeric: "tabular-nums" }}>
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Breakdown */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
          <div
            style={{
              width: "100%",
              maxWidth: "320px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              padding: "16px",
              background: "rgba(245, 243, 238, 0.4)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid rgba(208, 197, 175, 0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-body-sm)" }}>
              <span style={{ color: "var(--color-secondary)" }}>{t("purchases.table.subtotal") || "Sous-total"}</span>
              <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>{formatCurrency(purchase.subtotal)}</span>
            </div>

            {purchase.discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-body-sm)" }}>
                <span style={{ color: "var(--color-primary)" }}>{t("purchases.table.discount") || "Remise"}</span>
                <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 500, color: "var(--color-primary)" }}>
                  -{formatCurrency(purchase.discount)}
                </span>
              </div>
            )}

            <div style={{ height: "1px", background: "rgba(208, 197, 175, 0.3)", margin: "4px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: 700 }}>
              <span style={{ color: "var(--color-on-surface)" }}>{t("purchases.table.total") || "Total final"}</span>
              <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--color-on-surface)" }}>
                {formatCurrency(purchase.total)}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-body-sm)" }}>
              <span style={{ color: "var(--color-secondary)" }}>{t("purchases.table.amount_paid") || "Payé"}</span>
              <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600, color: "var(--color-tertiary)" }}>
                {formatCurrency(purchase.amountPaid)}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-body-sm)" }}>
              <span style={{ color: "var(--color-secondary)" }}>{t("purchases.table.remaining_debt") || "Dette"}</span>
              <span
                style={{
                  fontVariantNumeric: "tabular-nums",
                  fontWeight: 700,
                  color: remainingDebt > 0 ? "var(--color-error)" : "var(--color-tertiary)",
                }}
              >
                {formatCurrency(remainingDebt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
