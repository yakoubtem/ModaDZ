import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency } from "@/lib/utils";
import { Trash2, Plus } from "lucide-react";
import type { SupplierWithStats, Product, PurchaseItemFormData } from "@/types";

interface PurchaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<boolean>;
  suppliers: SupplierWithStats[];
  products: Product[];
}

interface SelectedItem {
  productId: number;
  productName: string;
  variantId: number;
  variantLabel: string;
  quantity: number;
  costPrice: number;
  total: number;
}

export function PurchaseFormModal({
  isOpen,
  onClose,
  onSubmit,
  suppliers,
  products,
}: PurchaseFormModalProps) {
  const { t, isRtl } = useTranslation();

  // Form general states
  const [supplierId, setSupplierId] = useState<number | undefined>(undefined);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cart / added items state
  const [items, setItems] = useState<SelectedItem[]>([]);

  // Item selector states
  const [selectedProductId, setSelectedProductId] = useState<number | undefined>(undefined);
  const [selectedVariantId, setSelectedVariantId] = useState<number | undefined>(undefined);
  const [itemQty, setItemQty] = useState(1);
  const [itemCostPrice, setItemCostPrice] = useState(0);

  // Errors
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize reference & clear fields on open
  useEffect(() => {
    if (isOpen) {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomId = Math.floor(1000 + Math.random() * 9000);
      setReference(`ACH-${dateStr}-${randomId}`);
      setSupplierId(undefined);
      setNotes("");
      setDiscount(0);
      setAmountPaid(0);
      setItems([]);
      setSelectedProductId(undefined);
      setSelectedVariantId(undefined);
      setItemQty(1);
      setItemCostPrice(0);
      setValidationError(null);
    }
  }, [isOpen]);

  // Selected Product variants
  const activeProduct = products.find((p) => p.id === selectedProductId);
  const variants = activeProduct?.variants || [];

  // Update variant when product changes
  useEffect(() => {
    if (variants.length > 0) {
      setSelectedVariantId(variants[0].id);
    } else {
      setSelectedVariantId(undefined);
    }
    // Pre-populate cost price with current product cost price if exists, or 0
    if (activeProduct) {
      setItemCostPrice(activeProduct.costPrice || 0);
    } else {
      setItemCostPrice(0);
    }
  }, [selectedProductId, variants, activeProduct]);

  // Calculations
  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const total = Math.max(0, subtotal - discount);
  const remainingDebt = Math.max(0, total - amountPaid);

  const handleAddItem = () => {
    if (!selectedProductId || !selectedVariantId || itemQty <= 0 || itemCostPrice < 0) {
      return;
    }

    const prod = products.find((p) => p.id === selectedProductId);
    const v = variants.find((varItem) => varItem.id === selectedVariantId);

    if (!prod || !v) return;

    const variantLabel = `${v.size} / ${v.color}`;

    const existingIndex = items.findIndex((i) => i.variantId === selectedVariantId);

    if (existingIndex > -1) {
      // Merge
      const updated = [...items];
      updated[existingIndex].quantity += itemQty;
      updated[existingIndex].total = updated[existingIndex].quantity * updated[existingIndex].costPrice;
      setItems(updated);
    } else {
      // Add new
      const newItem: SelectedItem = {
        productId: selectedProductId,
        productName: prod.name,
        variantId: selectedVariantId,
        variantLabel,
        quantity: itemQty,
        costPrice: itemCostPrice,
        total: itemQty * itemCostPrice,
      };
      setItems([...items, newItem]);
    }

    // Reset selectors
    setSelectedProductId(undefined);
    setSelectedVariantId(undefined);
    setItemQty(1);
    setItemCostPrice(0);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!supplierId) {
      setValidationError(t("purchases.errors.supplier_required") || "Veuillez sélectionner un fournisseur.");
      return;
    }
    if (items.length === 0) {
      setValidationError(t("purchases.errors.no_items") || "Veuillez ajouter au moins un produit à l'achat.");
      return;
    }
    if (amountPaid < 0) {
      setValidationError(t("purchases.errors.amount_paid_negative") || "Le montant payé ne peut pas être négatif.");
      return;
    }
    if (amountPaid > total) {
      setValidationError(t("purchases.errors.amount_paid_too_high") || "Le montant payé ne peut pas être supérieur au total.");
      return;
    }

    setIsSubmitting(true);
    const purchaseItemsPayload: PurchaseItemFormData[] = items.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      quantity: i.quantity,
      costPrice: i.costPrice,
    }));

    const success = await onSubmit({
      supplierId,
      reference: reference.trim(),
      items: purchaseItemsPayload,
      subtotal,
      discount,
      total,
      amountPaid,
      notes: notes.trim() || undefined,
    });

    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("purchases.add_purchase") || "Enregistrer un achat"}
      size="xl"
      scrollable
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {validationError && (
          <div className="alert-card alert-card-error">
            <span className="material-symbols-outlined text-[var(--color-error)]" style={{ fontSize: "20px" }}>
              error
            </span>
            <span style={{ fontSize: "14px", color: "var(--color-error)", fontWeight: 600 }}>
              {validationError}
            </span>
          </div>
        )}

        {/* Reference & Supplier */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Input
            label={t("purchases.table.reference") + " *"}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            required
          />

          <Select
            label={t("purchases.table.supplier") + " *"}
            value={supplierId !== undefined ? String(supplierId) : ""}
            onChange={(e) => setSupplierId(Number(e.target.value))}
            required
          >
            <option value="" disabled>
              {t("purchases.form.select_supplier")}
            </option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Item Intake Form */}
        <div
          style={{
            border: "1px solid rgba(208, 197, 175, 0.3)",
            borderRadius: "var(--radius-lg)",
            padding: "16px",
            background: "rgba(245, 243, 238, 0.4)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <h4 style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Ajouter un produit
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr auto", gap: "12px", alignItems: "flex-end" }}>
            <Select
              label={t("purchases.form.select_product")}
              value={selectedProductId !== undefined ? String(selectedProductId) : ""}
              onChange={(e) => setSelectedProductId(Number(e.target.value))}
            >
              <option value="">-- {t("purchases.form.select_product")} --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </Select>

            <Select
              label={t("purchases.form.select_variant")}
              value={selectedVariantId !== undefined ? String(selectedVariantId) : ""}
              onChange={(e) => setSelectedVariantId(Number(e.target.value))}
              disabled={!selectedProductId}
            >
              {!selectedProductId && <option value="">Choisir un produit d'abord</option>}
              {selectedProductId && variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.size} / {v.color} (Stock: {v.stock})
                </option>
              ))}
            </Select>

            <Input
              type="number"
              label={t("purchases.form.cost_price")}
              value={itemCostPrice || ""}
              onChange={(e) => setItemCostPrice(Number(e.target.value))}
              min="0"
              placeholder="0"
            />

            <Input
              type="number"
              label={t("purchases.form.quantity")}
              value={itemQty || ""}
              onChange={(e) => setItemQty(Number(e.target.value))}
              min="1"
              placeholder="1"
            />

            <Button
              type="button"
              variant="outline"
              onClick={handleAddItem}
              disabled={!selectedProductId || !selectedVariantId || itemQty <= 0}
              style={{ height: "44px", display: "flex", alignItems: "center", justifyContent: "center", minWidth: "44px", padding: 0 }}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Added Items List */}
        <div>
          <h4 style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
            {t("purchases.form.items_list")} ({items.length})
          </h4>
          <div style={{ border: "1px solid rgba(208, 197, 175, 0.2)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-body-sm)" }}>
              <thead>
                <tr style={{ background: "rgba(245, 243, 238, 0.6)", borderBottom: "1px solid rgba(208, 197, 175, 0.2)" }}>
                  <th style={{ padding: "10px 16px", textAlign: isRtl ? "right" : "left", color: "var(--color-secondary)", fontSize: "11px", fontWeight: 600 }}>Produit</th>
                  <th style={{ padding: "10px 16px", textAlign: isRtl ? "right" : "left", color: "var(--color-secondary)", fontSize: "11px", fontWeight: 600 }}>Taille / Couleur</th>
                  <th style={{ padding: "10px 16px", textAlign: "right", color: "var(--color-secondary)", fontSize: "11px", fontWeight: 600 }}>Coût (PU)</th>
                  <th style={{ padding: "10px 16px", textAlign: "right", color: "var(--color-secondary)", fontSize: "11px", fontWeight: 600 }}>Qté</th>
                  <th style={{ padding: "10px 16px", textAlign: "right", color: "var(--color-secondary)", fontSize: "11px", fontWeight: 600 }}>Total</th>
                  <th style={{ padding: "10px 16px", textAlign: "center", color: "var(--color-secondary)", fontSize: "11px", fontWeight: 600, width: "60px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "24px", textAlign: "center", color: "var(--color-outline)", fontStyle: "italic" }}>
                      Aucun produit ajouté à la liste.
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid rgba(208, 197, 175, 0.15)" }}>
                      <td style={{ padding: "10px 16px", fontWeight: 500, color: "var(--color-on-surface)" }}>{item.productName}</td>
                      <td style={{ padding: "10px 16px", color: "var(--color-secondary)" }}>{item.variantLabel}</td>
                      <td style={{ padding: "10px 16px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(item.costPrice)}</td>
                      <td style={{ padding: "10px 16px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{item.quantity}</td>
                      <td style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600, color: "var(--color-on-surface)", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(item.total)}</td>
                      <td style={{ padding: "10px 16px", textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--color-error)",
                            cursor: "pointer",
                            padding: "4px",
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes & Financial Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
          <div>
            <Textarea
              label={t("purchases.form.notes_label")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes concernant la livraison ou le paiement..."
              rows={4}
            />
          </div>

          <div
            style={{
              padding: "20px",
              background: "rgba(245, 243, 238, 0.5)",
              border: "1px solid rgba(208, 197, 175, 0.35)",
              borderRadius: "var(--radius-xl)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
              <span style={{ color: "var(--color-secondary)" }}>{t("purchases.form.subtotal_label") || "Sous-total :"}</span>
              <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{formatCurrency(subtotal)}</span>
            </div>

            <div>
              <Input
                type="number"
                label={t("purchases.form.discount_label") || "Remise totale (DZD)"}
                value={discount || ""}
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                min="0"
                max={subtotal}
                placeholder="0"
              />
            </div>

            <div style={{ borderTop: "1px solid rgba(208, 197, 175, 0.3)", paddingTop: "8px" }} />

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: 700 }}>
              <span style={{ color: "var(--color-on-surface)" }}>{t("purchases.form.total_label") || "Total final :"}</span>
              <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--color-on-surface)" }}>{formatCurrency(total)}</span>
            </div>

            <div>
              <Input
                type="number"
                label={t("purchases.form.amount_paid_label") || "Montant payé (DZD)"}
                value={amountPaid || ""}
                onChange={(e) => setAmountPaid(Math.max(0, Number(e.target.value)))}
                min="0"
                max={total}
                placeholder="0"
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 600 }}>
              <span style={{ color: "var(--color-secondary)" }}>{t("purchases.form.remaining_debt_label") || "Dette restante :"}</span>
              <span
                style={{
                  fontVariantNumeric: "tabular-nums",
                  color: remainingDebt > 0 ? "var(--color-error)" : "var(--color-tertiary)",
                }}
              >
                {formatCurrency(remainingDebt)}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px", flexDirection: isRtl ? "row-reverse" : "row" }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("common.buttons.cancel")}
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={items.length === 0}>
            {t("common.buttons.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
