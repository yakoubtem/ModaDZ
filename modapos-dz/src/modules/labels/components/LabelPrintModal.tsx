import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useTranslation } from "@/hooks/useTranslation";
import { BarcodeRenderer } from "../utils/barcodeGenerator";
import type { Product, ProductVariant } from "@/types";
import { toast } from "sonner";

interface LabelPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  selectedVariant?: ProductVariant | null;
}

export function LabelPrintModal({
  isOpen,
  onClose,
  product,
  selectedVariant = null,
}: LabelPrintModalProps) {
  const { t } = useTranslation();

  const [quantity, setQuantity] = useState<number>(1);
  const [format, setFormat] = useState<string>("50x30");
  const [barcodeType, setBarcodeType] = useState<string>("auto");
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [showSku, setShowSku] = useState<boolean>(true);
  const [showName, setShowName] = useState<boolean>(true);
  const [showLogo, setShowLogo] = useState<boolean>(true);
  
  const [variant, setVariant] = useState<ProductVariant | null>(null);

  // Sync state when product or selectedVariant changes
  useEffect(() => {
    if (product) {
      if (selectedVariant) {
        setVariant(selectedVariant);
      } else if (product.variants && product.variants.length > 0) {
        setVariant(product.variants[0]);
      } else {
        setVariant(null);
      }
      setBarcodeType(product.barcodeType || "auto");
    }
  }, [product, selectedVariant]);

  if (!product) return null;

  const barcodeValue = variant?.barcode || product.sku || "0000000000000";

  const handlePrint = async () => {
    if (quantity <= 0) {
      toast.error(t("labels.messages.printError"));
      return;
    }

    try {
      // 1. Create hidden print container
      const printContainerId = "modadz-print-container";
      let printContainer = document.getElementById(printContainerId);
      if (printContainer) {
        printContainer.remove();
      }
      
      printContainer = document.createElement("div");
      printContainer.id = printContainerId;
      document.body.appendChild(printContainer);

      // 2. Select layout rules based on format
      const isA4 = format.startsWith("a4");
      const gridCols = format === "a4_24" ? 3 : format === "a4_30" ? 3 : 1;
      
      // Dynamic styles injection for page sizes
      const styleElement = document.createElement("style");
      styleElement.innerHTML = `
        @media screen {
          #${printContainerId} { display: none; }
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #${printContainerId}, #${printContainerId} * {
            visibility: visible;
          }
          #${printContainerId} {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: white;
            color: black;
            box-sizing: border-box;
          }
          
          /* Page break settings */
          .print-label-item {
            page-break-inside: avoid;
            break-inside: avoid;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border: 1px dashed #ccc;
            text-align: center;
          }

          /* Format presets */
          ${
            format === "40x30"
              ? `@page { size: 40mm 30mm; margin: 0; } .print-label-item { width: 40mm; height: 30mm; padding: 2mm; }`
              : format === "50x30"
              ? `@page { size: 50mm 30mm; margin: 0; } .print-label-item { width: 50mm; height: 30mm; padding: 2mm; }`
              : format === "60x40"
              ? `@page { size: 60mm 40mm; margin: 0; } .print-label-item { width: 60mm; height: 40mm; padding: 3mm; }`
              : format === "80x50"
              ? `@page { size: 80mm 50mm; margin: 0; } .print-label-item { width: 80mm; height: 50mm; padding: 4mm; }`
              : format === "thermal"
              ? `@page { size: auto; margin: 0; } .print-label-item { width: 58mm; height: auto; padding: 4mm; border-bottom: 1px dashed black; }`
              : isA4
              ? `@page { size: A4; margin: 5mm; } 
                 #${printContainerId} {
                   display: grid;
                   grid-template-columns: repeat(${gridCols}, 1fr);
                   gap: 3mm;
                   padding: 5mm;
                 }
                 .print-label-item {
                   height: ${format === "a4_24" ? "34mm" : "27mm"};
                   border: 1px solid #ddd;
                   padding: 2mm;
                 }`
              : ""
          }
        }
      `;
      document.head.appendChild(styleElement);

      // 3. Render label HTML repeatedly into print container
      const renderLabelHTML = (index: number) => {
        return `
          <div class="print-label-item" style="display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; background: white; color: black; box-sizing: border-box;">
            ${showLogo ? `<div style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;">ModaDZ</div>` : ""}
            ${showName ? `<div style="font-size: 11px; font-weight: bold; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px;">${product.name}</div>` : ""}
            
            <div style="display: flex; gap: 8px; font-size: 10px; margin-bottom: 2px; color: #555;">
              ${variant?.size ? `<span>Taille: ${variant.size}</span>` : ""}
              ${variant?.color ? `<span>Couleur: ${variant.color}</span>` : ""}
            </div>

            <!-- Vector barcode image placeholder -->
            <div class="barcode-svg-wrapper-${index}" style="margin: 2px 0;"></div>

            <div style="display: flex; justify-content: space-between; width: 100%; padding: 0 4px; box-sizing: border-box; margin-top: 2px;">
              ${showSku ? `<span style="font-size: 9px; font-family: monospace;">${product.sku}</span>` : "<span></span>"}
              ${showPrice ? `<span style="font-size: 10px; font-weight: bold;">${product.price.toLocaleString("fr-DZ")} DZD</span>` : ""}
            </div>
          </div>
        `;
      };

      let itemsHtml = "";
      for (let i = 0; i < quantity; i++) {
        itemsHtml += renderLabelHTML(i);
      }
      printContainer.innerHTML = itemsHtml;

      // 4. Inject SVG barcodes in each item
      for (let i = 0; i < quantity; i++) {
        const wrapper = printContainer.querySelector(`.barcode-svg-wrapper-${i}`);
        if (wrapper) {
          // Clone SVG from screen preview component
          const previewSvg = document.querySelector("#preview-barcode-svg-element svg");
          if (previewSvg) {
            const clonedSvg = previewSvg.cloneNode(true) as SVGSVGElement;
            clonedSvg.setAttribute("width", format.startsWith("40") ? "90" : "130");
            clonedSvg.setAttribute("height", format.startsWith("40") ? "25" : "35");
            wrapper.appendChild(clonedSvg);
          }
        }
      }

      // 5. Trigger print dialog
      setTimeout(() => {
        window.print();
        
        // Clean up
        styleElement.remove();
        printContainer.remove();
      }, 300);

      // 6. Log the print in SQLite database history
      if (window.api && window.api.invoke) {
        // Find current logged-in user from session storage or context
        const sessionStr = sessionStorage.getItem("auth_session");
        const session = sessionStr ? JSON.parse(sessionStr) : null;
        const userId = session?.user?.id || 1; // default to 1 if not found

        await window.api.invoke("labels:logPrint", {
          productId: product.id,
          userId,
          quantity,
          format,
          barcodeType,
        });
      }

      toast.success(t("labels.messages.printSuccess"));
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(t("labels.messages.printError"));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("labels.config.title")}
      size="lg"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="ghost" onClick={onClose}>
            {t("labels.buttons.cancel")}
          </Button>
          <Button variant="primary" onClick={handlePrint}>
            {t("labels.buttons.print")}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left: Config Sidebar */}
        <div className="md:col-span-3 space-y-4">
          <div className="bg-amber-50/50 dark:bg-zinc-800/30 p-4 rounded-xl border border-amber-200/30 dark:border-zinc-700/50 space-y-4">
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">
              {t("labels.config.settings")}
            </h3>
            
            {product.variants && product.variants.length > 0 && (
              <Select
                label={t("labels.quickPrint.selectVariant")}
                value={variant?.id || ""}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  const v = product.variants.find((x) => x.id === val);
                  if (v) setVariant(v);
                }}
              >
                {product.variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.size} / {v.color} {v.barcode ? `(${v.barcode})` : ""}
                  </option>
                ))}
              </Select>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                min={1}
                max={500}
                label={t("labels.config.quantity")}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />

              <Select
                label={t("labels.config.format")}
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                <option value="40x30">{t("labels.formats.40x30")}</option>
                <option value="50x30">{t("labels.formats.50x30")}</option>
                <option value="60x40">{t("labels.formats.60x40")}</option>
                <option value="80x50">{t("labels.formats.80x50")}</option>
                <option value="thermal">{t("labels.formats.thermal")}</option>
                <option value="a4_24">{t("labels.formats.a4_24")}</option>
                <option value="a4_30">{t("labels.formats.a4_30")}</option>
              </Select>
            </div>

            <Select
              label={t("labels.config.barcodeType")}
              value={barcodeType}
              onChange={(e) => setBarcodeType(e.target.value)}
            >
              <option value="auto">{t("labels.types.auto")}</option>
              <option value="ean13">{t("labels.types.ean13")}</option>
              <option value="qr">{t("labels.types.qr")}</option>
              <option value="custom">{t("labels.types.custom")}</option>
            </Select>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2">
              <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLogo}
                  onChange={(e) => setShowLogo(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 border-zinc-300"
                />
                {t("labels.config.showLogo")}
              </label>

              <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showName}
                  onChange={(e) => setShowName(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 border-zinc-300"
                />
                {t("labels.config.showName")}
              </label>

              <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSku}
                  onChange={(e) => setShowSku(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 border-zinc-300"
                />
                {t("labels.config.showSku")}
              </label>

              <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPrice}
                  onChange={(e) => setShowPrice(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 border-zinc-300"
                />
                {t("labels.config.showPrice")}
              </label>
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="md:col-span-2 flex flex-col justify-between space-y-4">
          <div className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-4 flex flex-col items-center justify-center bg-white dark:bg-zinc-900 min-h-[200px]">
            <span className="text-xs text-zinc-400 mb-2 uppercase tracking-wider font-semibold">
              {t("labels.config.preview")}
            </span>
            
            {/* Live sticker render */}
            <div 
              className="border border-zinc-200 dark:border-zinc-800 shadow-sm p-4 w-full bg-white text-zinc-900 rounded flex flex-col items-center justify-center text-center font-sans"
              style={{
                aspectRatio: "3 / 2",
                maxWidth: "240px",
              }}
            >
              {showLogo && (
                <div className="text-[10px] font-bold text-zinc-800 tracking-wider uppercase mb-1">
                  ModaDZ
                </div>
              )}
              
              {showName && (
                <div className="text-xs font-semibold text-zinc-900 line-clamp-1 mb-0.5">
                  {product.name}
                </div>
              )}

              <div className="flex gap-2 text-[10px] text-zinc-500 mb-1">
                {variant?.size && <span>T: {variant.size}</span>}
                {variant?.color && <span>C: {variant.color}</span>}
              </div>

              {/* Vector barcode preview wrapper with ID to clone from */}
              <div id="preview-barcode-svg-element" className="my-1">
                <BarcodeRenderer
                  value={barcodeValue}
                  type={barcodeType}
                  height={32}
                  width={1.3}
                  displayValue={false}
                />
              </div>

              <div className="flex justify-between w-full px-2 mt-1 text-[10px] font-mono">
                {showSku ? (
                  <span className="text-zinc-500">{product.sku}</span>
                ) : (
                  <span></span>
                )}
                {showPrice && (
                  <span className="font-bold text-zinc-900">
                    {product.price.toLocaleString("fr-DZ")} DZD
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50">
            💡 <strong>Format:</strong> {format} ({format.startsWith("a4") ? "A4 Sheet layout" : "Thermal sticker dimensions"}). Print preview scales automatically for scannability.
          </div>
        </div>
      </div>
    </Modal>
  );
}
