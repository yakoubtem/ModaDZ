import React, { useState, useEffect, useCallback } from "react";
import { TopBar } from "@/components/layout/AppLayout";
import { useIPC } from "@/hooks/useIPC";
import { useTranslation } from "@/hooks/useTranslation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { LabelPrintModal } from "./components/LabelPrintModal";
import type { Product, ProductVariant, LabelPrintHistory, LabelPrintStats } from "@/types";
import { toast } from "sonner";

interface BatchItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

type TabType = "quick" | "batch" | "history";

export function LabelsPage() {
  const { t, language, isRtl } = useTranslation();
  const api = useIPC();

  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>("quick");

  // Search/Product Selection State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVar, setSelectedVar] = useState<ProductVariant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Batch Printing Queue
  const [batchQueue, setBatchQueue] = useState<BatchItem[]>(() => {
    try {
      const saved = localStorage.getItem("modadz-labels-batch");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Batch configurations
  const [batchFormat, setBatchFormat] = useState<string>("50x30");
  const [batchShowPrice, setBatchShowPrice] = useState<boolean>(true);
  const [batchShowSku, setBatchShowSku] = useState<boolean>(true);
  const [batchShowName, setBatchShowName] = useState<boolean>(true);
  const [batchShowLogo, setBatchShowLogo] = useState<boolean>(true);

  // Statistics
  const [stats, setStats] = useState<LabelPrintStats>({
    todayCount: 0,
    monthCount: 0,
    topProducts: [],
  });

  // History State
  const [history, setHistory] = useState<LabelPrintHistory[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historySearch, setHistorySearch] = useState("");
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Sync Batch Queue to LocalStorage
  useEffect(() => {
    localStorage.setItem("modadz-labels-batch", JSON.stringify(batchQueue));
  }, [batchQueue]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const res = await api<LabelPrintStats>("labels:getStats");
      if (res) setStats(res);
    } catch (err) {
      console.error(err);
    }
  }, [api]);

  // Load history logs
  const loadHistory = useCallback(async () => {
    try {
      setIsHistoryLoading(true);
      const res = await api<{ history: LabelPrintHistory[]; total: number }>("labels:getHistory", {
        page: historyPage,
        pageSize: 15,
        search: historySearch,
      });
      if (res) {
        setHistory(res.history || []);
        setHistoryTotal(res.total || 0);
      }
    } catch (err) {
      console.error(err);
      toast.error(t("labels.messages.historyLoadError"));
    } finally {
      setIsHistoryLoading(false);
    }
  }, [api, historyPage, historySearch, t]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (activeTab === "history") {
      loadHistory();
    }
  }, [activeTab, loadHistory, historyPage, historySearch]);

  // Search logic (Quick Print)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      try {
        setIsSearching(true);
        // Reuse products:getAll IPC channel
        const res = await api<{ products: Product[] }>("products:getAll", {
          search: searchQuery,
          page: 1,
          pageSize: 20,
        });
        setSearchResults(res?.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, api]);

  // Add a variant to the printing batch queue
  const addToBatch = (product: Product, variant: ProductVariant) => {
    setBatchQueue((prev) => {
      const existing = prev.find((item) => item.variant.id === variant.id);
      if (existing) {
        return prev.map((item) =>
          item.variant.id === variant.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, variant, quantity: 1 }];
    });
    toast.success(t("labels.batch.addSuccess"));
  };

  const updateBatchQty = (variantId: number, qty: number) => {
    setBatchQueue((prev) =>
      prev.map((item) =>
        item.variant.id === variantId ? { ...item, quantity: Math.max(1, qty) } : item
      )
    );
  };

  const removeFromBatch = (variantId: number) => {
    setBatchQueue((prev) => prev.filter((item) => item.variant.id !== variantId));
  };

  const handlePrintBatch = async () => {
    if (batchQueue.length === 0) {
      toast.error(t("labels.batch.empty"));
      return;
    }

    try {
      // Create hidden print container
      const printContainerId = "modadz-print-container";
      let printContainer = document.getElementById(printContainerId);
      if (printContainer) printContainer.remove();

      printContainer = document.createElement("div");
      printContainer.id = printContainerId;
      document.body.appendChild(printContainer);

      const isA4 = batchFormat.startsWith("a4");
      const gridCols = batchFormat === "a4_24" ? 3 : batchFormat === "a4_30" ? 3 : 1;

      // Dynamic styles injection
      const styleElement = document.createElement("style");
      styleElement.innerHTML = `
        @media screen {
          #${printContainerId} { display: none; }
        }
        @media print {
          body * { visibility: hidden; }
          #${printContainerId}, #${printContainerId} * { visibility: visible; }
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
          ${batchFormat === "40x30"
          ? `@page { size: 40mm 30mm; margin: 0; } .print-label-item { width: 40mm; height: 30mm; padding: 2mm; }`
          : batchFormat === "50x30"
            ? `@page { size: 50mm 30mm; margin: 0; } .print-label-item { width: 50mm; height: 30mm; padding: 2mm; }`
            : batchFormat === "60x40"
              ? `@page { size: 60mm 40mm; margin: 0; } .print-label-item { width: 60mm; height: 40mm; padding: 3mm; }`
              : batchFormat === "80x50"
                ? `@page { size: 80mm 50mm; margin: 0; } .print-label-item { width: 80mm; height: 50mm; padding: 4mm; }`
                : batchFormat === "thermal"
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
                   height: ${batchFormat === "a4_24" ? "34mm" : "27mm"};
                   border: 1px solid #ddd;
                   padding: 2mm;
                 }`
                    : ""
        }
        }
      `;
      document.head.appendChild(styleElement);

      // Render items
      let html = "";
      let indexCounter = 0;

      const renderSingleItem = (item: BatchItem, idx: number) => {
        const barcodeVal = item.variant.barcode || item.product.sku || "00000000";
        return `
          <div class="print-label-item" style="display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; background: white; color: black; box-sizing: border-box;">
            ${batchShowLogo ? `<div style="font-size: 10px; font-weight: bold; text-transform: uppercase; margin-bottom: 2px;">ModaDZ</div>` : ""}
            ${batchShowName ? `<div style="font-size: 11px; font-weight: bold; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px;">${item.product.name}</div>` : ""}
            <div style="font-size: 10px; margin-bottom: 2px; color: #555;">
              Taille: ${item.variant.size} | Col: ${item.variant.color}
            </div>
            
            <!-- Dynamic placeholder containing data-attributes to generate barcode -->
            <div class="batch-barcode-svg-${idx}" data-val="${barcodeVal}" data-type="${item.product.barcodeType || "auto"}" style="margin: 2px 0;"></div>
            
            <div style="display: flex; justify-content: space-between; width: 100%; padding: 0 4px; box-sizing: border-box; margin-top: 2px;">
              ${batchShowSku ? `<span style="font-size: 9px; font-family: monospace;">${item.product.sku}</span>` : "<span></span>"}
              ${batchShowPrice ? `<span style="font-size: 10px; font-weight: bold;">${item.product.price.toLocaleString("fr-DZ")} DZD</span>` : ""}
            </div>
          </div>
        `;
      };

      batchQueue.forEach((item) => {
        for (let i = 0; i < item.quantity; i++) {
          html += renderSingleItem(item, indexCounter);
          indexCounter++;
        }
      });
      printContainer.innerHTML = html;

      // Import libraries dynamically or draw vector lines
      // Since JsBarcode is imported at root level, we can use it to draw to temporary SVG elements
      const JsBarcodeLib = (await import("jsbarcode")).default;
      const QRCodeLib = (await import("qrcode")).default;

      for (let i = 0; i < indexCounter; i++) {
        const placeholder = printContainer.querySelector(`.batch-barcode-svg-${i}`) as HTMLElement;
        if (placeholder) {
          const val = placeholder.getAttribute("data-val") || "";
          const bType = placeholder.getAttribute("data-type") || "auto";

          if (bType === "qr") {
            const qrSvgString = await QRCodeLib.toString(val, {
              type: "svg",
              margin: 1,
              width: 50,
            });
            placeholder.innerHTML = qrSvgString;
          } else {
            const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            placeholder.appendChild(svgElement);
            try {
              JsBarcodeLib(svgElement, val, {
                format: bType === "ean13" ? "EAN13" : "CODE128",
                width: batchFormat.startsWith("40") ? 1.0 : 1.3,
                height: batchFormat.startsWith("40") ? 20 : 30,
                displayValue: false,
                margin: 0,
              });
            } catch (e) {
              console.error("Batch print barcode error:", e);
            }
          }
        }
      }

      // Print
      setTimeout(async () => {
        window.print();
        styleElement.remove();
        printContainer.remove();

        // Save history inside SQLite loop-logged
        if (window.api && window.api.invoke) {
          const sessionStr = sessionStorage.getItem("auth_session");
          const session = sessionStr ? JSON.parse(sessionStr) : null;
          const userId = session?.user?.id || 1;

          for (const item of batchQueue) {
            await window.api.invoke("labels:logPrint", {
              productId: item.product.id,
              userId,
              quantity: item.quantity,
              format: batchFormat,
              barcodeType: item.product.barcodeType || "auto",
            });
          }
        }

        toast.success(t("labels.messages.printSuccess"));
        setBatchQueue([]); // Clear batch queue
        loadStats(); // Reload statistics
      }, 500);

    } catch (err) {
      console.error(err);
      toast.error(t("labels.messages.printError"));
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopBar title={t("common.sidebar.labels")} description={t("labels.subtitle")} />

      <main
        style={{
          padding: "var(--space-container)",
          maxWidth: 1440,
          margin: "0 auto",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-card-gap)",
        }}
        className="animate-fade-in"
      >
        {/* KPI Cards Widget */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "var(--space-card-gap)",
            marginBottom: "var(--space-card-gap)",
          }}
        >
          <div
            className="glass-panel"
            style={{
              padding: "24px",
              borderRadius: "var(--radius-xl)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--color-secondary)", flexDirection: isRtl ? "row-reverse" : "row" }}>
              <span style={{ fontSize: "var(--text-label-md)", fontWeight: "var(--fw-label-md)", letterSpacing: "var(--ls-label-md)", textTransform: "uppercase" }}>
                {t("labels.stats.todayCount")}
              </span>
              <span className="material-symbols-outlined text-amber-500">today</span>
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-display-lg)",
                fontWeight: "var(--fw-display-lg)",
                color: "var(--color-on-surface)",
                marginTop: "8px",
                textAlign: isRtl ? "right" : "left",
              }}
            >
              {stats.todayCount.toLocaleString(language === "ar" ? "ar-DZ" : "fr-DZ")}
            </div>
          </div>

          <div
            className="glass-panel"
            style={{
              padding: "24px",
              borderRadius: "var(--radius-xl)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--color-secondary)", flexDirection: isRtl ? "row-reverse" : "row" }}>
              <span style={{ fontSize: "var(--text-label-md)", fontWeight: "var(--fw-label-md)", letterSpacing: "var(--ls-label-md)", textTransform: "uppercase" }}>
                {t("labels.stats.monthCount")}
              </span>
              <span className="material-symbols-outlined text-amber-500">calendar_today</span>
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-display-lg)",
                fontWeight: "var(--fw-display-lg)",
                color: "var(--color-on-surface)",
                marginTop: "8px",
                textAlign: isRtl ? "right" : "left",
              }}
            >
              {stats.monthCount.toLocaleString(language === "ar" ? "ar-DZ" : "fr-DZ")}
            </div>
          </div>

          {/* Top Printed Mini List */}
          <div
            className="glass-panel"
            style={{
              padding: "24px",
              borderRadius: "var(--radius-xl)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <span style={{ fontSize: "var(--text-label-sm)", fontWeight: "var(--fw-label-sm)", letterSpacing: "var(--ls-label-sm)", textTransform: "uppercase", color: "var(--color-secondary)", marginBottom: "8px", textAlign: isRtl ? "right" : "left" }}>
              🔥 {t("labels.stats.topProducts")}
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {stats.topProducts.slice(0, 3).map((tp, idx) => (
                <div key={tp.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <span style={{ fontWeight: 600, color: "var(--color-on-surface)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px" }}>
                    {idx + 1}. {tp.name}
                  </span>
                  <Badge variant="accent">
                    {tp.quantityPrinted} {t("labels.table.quantity")}
                  </Badge>
                </div>
              ))}
              {stats.topProducts.length === 0 && (
                <span style={{ fontSize: "13px", color: "var(--color-outline)", fontStyle: "italic", textAlign: isRtl ? "right" : "left" }}>Aucune donnée</span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          className="glass-panel"
          style={{
            padding: "6px",
            borderRadius: "var(--radius-lg)",
            display: "inline-flex",
            gap: "4px",
            width: "fit-content",
            flexDirection: isRtl ? "row-reverse" : "row",
            marginBottom: "8px",
          }}
        >
          <button
            onClick={() => setActiveTab("quick")}
            style={{
              padding: "10px 24px",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--text-label-md)",
              fontWeight: 600,
              fontFamily: "var(--font-body)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
              backgroundColor: activeTab === "quick" ? "var(--color-primary)" : "transparent",
              color: activeTab === "quick" ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
              boxShadow: activeTab === "quick" ? "var(--shadow-gold)" : "none",
            }}
          >
            {t("labels.tabs.quickPrint")}
          </button>
          <button
            onClick={() => setActiveTab("batch")}
            style={{
              padding: "10px 24px",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--text-label-md)",
              fontWeight: 600,
              fontFamily: "var(--font-body)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: activeTab === "batch" ? "var(--color-primary)" : "transparent",
              color: activeTab === "batch" ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
              boxShadow: activeTab === "batch" ? "var(--shadow-gold)" : "none",
              flexDirection: isRtl ? "row-reverse" : "row",
            }}
          >
            {t("labels.tabs.batchPrint")}
            {batchQueue.length > 0 && (
              <span
                style={{
                  backgroundColor: "var(--color-error)",
                  color: "white",
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: "9999px",
                  lineHeight: 1,
                }}
              >
                {batchQueue.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            style={{
              padding: "10px 24px",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--text-label-md)",
              fontWeight: 600,
              fontFamily: "var(--font-body)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
              backgroundColor: activeTab === "history" ? "var(--color-primary)" : "transparent",
              color: activeTab === "history" ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
              boxShadow: activeTab === "history" ? "var(--shadow-gold)" : "none",
            }}
          >
            {t("labels.tabs.history")}
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div
          className="glass-panel"
          style={{
            borderRadius: "var(--radius-xl)",
            overflow: "hidden",
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* 1. QUICK PRINT */}
          {activeTab === "quick" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Product search box */}
              <div style={{ maxWidth: "480px", width: "100%" }}>
                <Input
                  type="text"
                  placeholder={t("labels.quickPrint.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<span className="material-symbols-outlined text-xl">search</span>}
                />
              </div>

              {/* Search results list */}
              {isSearching ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: "56px", borderRadius: "var(--radius-lg)" }} />
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                <div
                  style={{
                    border: "1px solid rgba(208,197,175,0.3)",
                    borderRadius: "var(--radius-xl)",
                    overflow: "hidden",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      textAlign: isRtl ? "right" : "left",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: "rgba(245, 243, 238, 0.5)",
                          borderBottom: "1px solid rgba(208,197,175,0.3)",
                          color: "var(--color-secondary)",
                          fontWeight: "bold",
                        }}
                      >
                        <th style={{ padding: "16px 24px", fontSize: "var(--text-label-sm)", letterSpacing: "var(--ls-label-sm)", textTransform: "uppercase", textAlign: isRtl ? "right" : "left" }}>{t("labels.table.product")}</th>
                        <th style={{ padding: "16px 24px", fontSize: "var(--text-label-sm)", letterSpacing: "var(--ls-label-sm)", textTransform: "uppercase", textAlign: isRtl ? "right" : "left" }}>{t("labels.table.sku")}</th>
                        <th style={{ padding: "16px 24px", fontSize: "var(--text-label-sm)", letterSpacing: "var(--ls-label-sm)", textTransform: "uppercase", textAlign: isRtl ? "right" : "left" }}>{t("labels.table.price")}</th>
                        <th style={{ padding: "16px 24px", fontSize: "var(--text-label-sm)", letterSpacing: "var(--ls-label-sm)", textTransform: "uppercase", textAlign: isRtl ? "left" : "right" }}>{t("labels.table.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((prod) => (
                        <React.Fragment key={prod.id}>
                          {/* Main Row */}
                          <tr style={{ borderBottom: "1px solid rgba(208,197,175,0.2)", background: "rgba(212,175,55,0.05)" }}>
                            <td style={{ padding: "16px 24px", fontWeight: "bold", color: "var(--color-on-surface)" }}>
                              {prod.name}
                            </td>
                            <td style={{ padding: "16px 24px", fontFamily: "monospace" }}>{prod.sku}</td>
                            <td style={{ padding: "16px 24px", fontWeight: "bold", color: "var(--color-on-surface)" }}>{prod.price.toLocaleString("fr-DZ")} DZD</td>
                            <td style={{ padding: "16px 24px", textAlign: isRtl ? "left" : "right" }}>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => {
                                  setSelectedProduct(prod);
                                  setSelectedVar(null);
                                  setIsModalOpen(true);
                                }}
                              >
                                {t("labels.buttons.print")}
                              </Button>
                            </td>
                          </tr>
                          {/* Variant sub-rows */}
                          {prod.variants?.map((v) => (
                            <tr
                              key={v.id}
                              style={{
                                borderBottom: "1px solid rgba(208,197,175,0.1)",
                                fontSize: "13px",
                                transition: "background 0.15s ease",
                              }}
                              className="hover:bg-zinc-50 dark:hover:bg-zinc-850"
                            >
                              <td style={{ padding: "12px 24px", paddingLeft: isRtl ? "24px" : "48px", paddingRight: isRtl ? "48px" : "24px", display: "flex", alignItems: "center", gap: "8px", flexDirection: isRtl ? "row-reverse" : "row" }}>
                                <span className="material-symbols-outlined text-zinc-400" style={{ fontSize: 16 }}>
                                  subdirectory_arrow_right
                                </span>
                                <span style={{ fontWeight: 600, color: "var(--color-on-surface-variant)" }}>
                                  {v.size} / {v.color}
                                </span>
                                {v.barcode && (
                                  <Badge variant="default" className="font-mono text-[10px]">
                                    {v.barcode}
                                  </Badge>
                                )}
                              </td>
                              <td style={{ padding: "12px 24px" }}></td>
                              <td style={{ padding: "12px 24px", color: "var(--color-outline)" }}>
                                {t("labels.table.stock")}: {v.stock}
                              </td>
                              <td style={{ padding: "12px 24px", textAlign: isRtl ? "left" : "right" }}>
                                <div style={{ display: "flex", gap: "8px", justifyContent: isRtl ? "flex-start" : "flex-end", alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
                                  <button
                                    onClick={() => addToBatch(prod, v)}
                                    style={{
                                      height: "32px",
                                      padding: "0 12px",
                                      borderRadius: "var(--radius-md)",
                                      border: "1px solid var(--color-primary)",
                                      background: "transparent",
                                      color: "var(--color-primary)",
                                      fontSize: "12px",
                                      fontWeight: 600,
                                      fontFamily: "var(--font-body)",
                                      cursor: "pointer",
                                      transition: "all 0.2s ease",
                                    }}
                                    className="hover:bg-amber-50 dark:hover:bg-zinc-800"
                                  >
                                    {t("labels.buttons.addToBatch")}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedProduct(prod);
                                      setSelectedVar(v);
                                      setIsModalOpen(true);
                                    }}
                                    style={{
                                      height: "32px",
                                      padding: "0 12px",
                                      borderRadius: "var(--radius-md)",
                                      border: "none",
                                      background: "var(--color-primary-container)",
                                      color: "var(--color-on-primary-container)",
                                      fontSize: "12px",
                                      fontWeight: 600,
                                      fontFamily: "var(--font-body)",
                                      cursor: "pointer",
                                      transition: "all 0.2s ease",
                                    }}
                                    className="hover:bg-amber-100"
                                  >
                                    {t("labels.buttons.print")}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                searchQuery.trim() && (
                  <div style={{ textAlign: "center", padding: "48px 0", color: "var(--color-outline)" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 48, display: "block", marginBottom: "8px" }}>
                      search_off
                    </span>
                    Aucun produit trouvé pour "{searchQuery}"
                  </div>
                )
              )}
            </div>
          )}

          {/* 2. BATCH PRINTING QUEUE */}
          {activeTab === "batch" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "16px",
                  borderBottom: "1px solid rgba(208,197,175,0.2)",
                  paddingBottom: "16px",
                  flexDirection: isRtl ? "row-reverse" : "row",
                }}
              >
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: "bold", fontSize: "var(--text-headline-md)", color: "var(--color-on-surface)" }}>
                    {t("labels.batch.title")}
                  </h2>
                  <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-outline)" }}>
                    {t("labels.batch.itemsCount", { count: batchQueue.length })}
                  </p>
                </div>

                {batchQueue.length > 0 && (
                  <div style={{ display: "flex", gap: "12px", flexDirection: isRtl ? "row-reverse" : "row" }}>
                    <button
                      onClick={() => setBatchQueue([])}
                      style={{
                        height: "40px",
                        padding: "0 16px",
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid var(--color-danger)",
                        background: "transparent",
                        color: "var(--color-danger)",
                        fontWeight: 600,
                        fontFamily: "var(--font-body)",
                        fontSize: "var(--text-body-sm)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      className="hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      {t("labels.batch.clearQueue")}
                    </button>
                    <button
                      onClick={handlePrintBatch}
                      style={{
                        height: "40px",
                        padding: "0 20px",
                        borderRadius: "var(--radius-lg)",
                        border: "none",
                        background: "var(--color-primary)",
                        color: "var(--color-on-primary)",
                        fontWeight: 600,
                        fontFamily: "var(--font-body)",
                        fontSize: "var(--text-body-sm)",
                        cursor: "pointer",
                        boxShadow: "var(--shadow-gold)",
                        transition: "all 0.2s ease",
                      }}
                      className="hover:opacity-90"
                    >
                      {t("labels.batch.printAll")}
                    </button>
                  </div>
                )}
              </div>

              {batchQueue.length === 0 ? (
                <div style={{ textAlign: "center", padding: "64px 0", color: "var(--color-outline)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.5 }}>layers_clear</span>
                  <p style={{ maxWidth: "320px", fontSize: "var(--text-body-sm)" }}>{t("labels.batch.empty")}</p>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "8fr 4fr",
                    gap: "24px",
                  }}
                >
                  {/* Left: Queue items list */}
                  <div
                    style={{
                      border: "1px solid rgba(208,197,175,0.3)",
                      borderRadius: "var(--radius-xl)",
                      overflow: "hidden",
                      background: "rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: isRtl ? "right" : "left" }}>
                      <thead>
                        <tr style={{ background: "rgba(245, 243, 238, 0.5)", borderBottom: "1px solid rgba(208,197,175,0.3)", fontWeight: "bold" }}>
                          <th style={{ padding: "16px 24px", fontSize: "var(--text-label-sm)", letterSpacing: "var(--ls-label-sm)", textTransform: "uppercase", textAlign: isRtl ? "right" : "left" }}>{t("labels.table.product")}</th>
                          <th style={{ padding: "16px 24px", fontSize: "var(--text-label-sm)", letterSpacing: "var(--ls-label-sm)", textTransform: "uppercase", textAlign: isRtl ? "right" : "left" }}>{t("labels.table.barcode")}</th>
                          <th style={{ padding: "16px 24px", width: "120px", textAlign: "center", fontSize: "var(--text-label-sm)", letterSpacing: "var(--ls-label-sm)", textTransform: "uppercase" }}>{t("labels.batch.quantityShort")}</th>
                          <th style={{ padding: "16px 24px", width: "80px" }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {batchQueue.map((item) => (
                          <tr
                            key={item.variant.id}
                            style={{ borderBottom: "1px solid rgba(208,197,175,0.2)" }}
                            className="hover:bg-zinc-50 dark:hover:bg-zinc-850"
                          >
                            <td style={{ padding: "16px 24px" }}>
                              <div style={{ fontWeight: "bold", color: "var(--color-on-surface)", textAlign: isRtl ? "right" : "left" }}>
                                {item.product.name}
                              </div>
                              <div style={{ fontSize: "var(--text-body-sm)", color: "var(--color-outline)", marginTop: "4px", textAlign: isRtl ? "right" : "left" }}>
                                {item.variant.size} / {item.variant.color} | SKU: {item.product.sku}
                              </div>
                            </td>
                            <td style={{ padding: "16px 24px", fontFamily: "monospace", fontSize: "var(--text-body-sm)" }}>
                              {item.variant.barcode || item.product.sku}
                            </td>
                            <td style={{ padding: "16px 24px", textAlign: "center" }}>
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) =>
                                  updateBatchQty(item.variant.id, parseInt(e.target.value) || 1)
                                }
                                style={{
                                  width: "80px",
                                  height: "40px",
                                  padding: "8px",
                                  textAlign: "center",
                                  border: "1.5px solid rgba(208,197,175,0.4)",
                                  borderRadius: "var(--radius-md)",
                                  background: "var(--color-surface)",
                                  fontSize: "var(--text-body-sm)",
                                  fontWeight: 600,
                                  color: "var(--color-on-surface)",
                                  outline: "none",
                                }}
                              />
                            </td>
                            <td style={{ padding: "16px 24px", textAlign: isRtl ? "left" : "right" }}>
                              <button
                                onClick={() => removeFromBatch(item.variant.id)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "var(--color-danger)",
                                  cursor: "pointer",
                                  padding: "4px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                title={t("labels.batch.remove")}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Right: Layout Config card */}
                  <div
                    style={{
                      background: "var(--color-surface-container-low)",
                      border: "1px solid rgba(208,197,175,0.3)",
                      borderRadius: "var(--radius-xl)",
                      padding: "24px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                      height: "fit-content",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "var(--text-label-md)",
                        fontWeight: "var(--fw-label-md)",
                        letterSpacing: "var(--ls-label-md)",
                        color: "var(--color-on-surface)",
                        textTransform: "uppercase",
                        borderBottom: "1px solid rgba(208,197,175,0.2)",
                        paddingBottom: "10px",
                        textAlign: isRtl ? "right" : "left",
                      }}
                    >
                      Configuration du Lot
                    </h3>

                    <Select
                      label={t("labels.config.format")}
                      value={batchFormat}
                      onChange={(e) => setBatchFormat(e.target.value)}
                    >
                      <option value="40x30">{t("labels.formats.40x30")}</option>
                      <option value="50x30">{t("labels.formats.50x30")}</option>
                      <option value="60x40">{t("labels.formats.60x40")}</option>
                      <option value="80x50">{t("labels.formats.80x50")}</option>
                      <option value="thermal">{t("labels.formats.thermal")}</option>
                      <option value="a4_24">{t("labels.formats.a4_24")}</option>
                      <option value="a4_30">{t("labels.formats.a4_30")}</option>
                    </Select>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingTop: "12px", borderTop: "1px solid rgba(208,197,175,0.2)", textAlign: isRtl ? "right" : "left" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-body-sm)", color: "var(--color-on-surface-variant)", cursor: "pointer", flexDirection: isRtl ? "row-reverse" : "row" }}>
                        <input
                          type="checkbox"
                          checked={batchShowLogo}
                          onChange={(e) => setBatchShowLogo(e.target.checked)}
                          style={{ width: "16px", height: "16px", accentColor: "var(--color-primary)" }}
                        />
                        {t("labels.config.showLogo")}
                      </label>

                      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-body-sm)", color: "var(--color-on-surface-variant)", cursor: "pointer", flexDirection: isRtl ? "row-reverse" : "row" }}>
                        <input
                          type="checkbox"
                          checked={batchShowName}
                          onChange={(e) => setBatchShowName(e.target.checked)}
                          style={{ width: "16px", height: "16px", accentColor: "var(--color-primary)" }}
                        />
                        {t("labels.config.showName")}
                      </label>

                      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-body-sm)", color: "var(--color-on-surface-variant)", cursor: "pointer", flexDirection: isRtl ? "row-reverse" : "row" }}>
                        <input
                          type="checkbox"
                          checked={batchShowSku}
                          onChange={(e) => setBatchShowSku(e.target.checked)}
                          style={{ width: "16px", height: "16px", accentColor: "var(--color-primary)" }}
                        />
                        {t("labels.config.showSku")}
                      </label>

                      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-body-sm)", color: "var(--color-on-surface-variant)", cursor: "pointer", flexDirection: isRtl ? "row-reverse" : "row" }}>
                        <input
                          type="checkbox"
                          checked={batchShowPrice}
                          onChange={(e) => setBatchShowPrice(e.target.checked)}
                          style={{ width: "16px", height: "16px", accentColor: "var(--color-primary)" }}
                        />
                        {t("labels.config.showPrice")}
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. PRINT HISTORY LOGS */}
          {activeTab === "history" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Search Log input */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "16px",
                  borderBottom: "1px solid rgba(208,197,175,0.2)",
                  paddingBottom: "16px",
                  flexDirection: isRtl ? "row-reverse" : "row",
                }}
              >
                <div style={{ maxWidth: "360px", width: "100%" }}>
                  <Input
                    type="text"
                    placeholder="Filtrer l'historique par produit..."
                    value={historySearch}
                    onChange={(e) => {
                      setHistorySearch(e.target.value);
                      setHistoryPage(1); // reset to page 1
                    }}
                    leftIcon={<span className="material-symbols-outlined text-lg">search</span>}
                  />
                </div>
              </div>

              {isHistoryLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: "48px", borderRadius: "var(--radius-md)" }} />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div style={{ textAlign: "center", padding: "64px 0", color: "var(--color-outline)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.5 }}>history</span>
                  <p style={{ fontSize: "var(--text-body-sm)" }}>Aucun historique d'impression trouvé.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div
                    style={{
                      border: "1px solid rgba(208,197,175,0.3)",
                      borderRadius: "var(--radius-xl)",
                      overflow: "hidden",
                    }}
                  >
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: isRtl ? "right" : "left" }}>
                      <thead>
                        <tr style={{ background: "rgba(245, 243, 238, 0.5)", borderBottom: "1px solid rgba(208,197,175,0.3)", fontWeight: "bold", color: "var(--color-secondary)" }}>
                          <th style={{ padding: "16px 24px", fontSize: "var(--text-label-sm)", letterSpacing: "var(--ls-label-sm)", textTransform: "uppercase", textAlign: isRtl ? "right" : "left" }}>{t("labels.table.product")}</th>
                          <th style={{ padding: "16px 24px", fontSize: "var(--text-label-sm)", letterSpacing: "var(--ls-label-sm)", textTransform: "uppercase", textAlign: isRtl ? "right" : "left" }}>{t("labels.table.sku")}</th>
                          <th style={{ padding: "16px 24px", width: "100px", textAlign: "center", fontSize: "var(--text-label-sm)", letterSpacing: "var(--ls-label-sm)", textTransform: "uppercase" }}>{t("labels.table.quantity")}</th>
                          <th style={{ padding: "16px 24px", fontSize: "var(--text-label-sm)", letterSpacing: "var(--ls-label-sm)", textTransform: "uppercase", textAlign: isRtl ? "right" : "left" }}>{t("labels.table.format")}</th>
                          <th style={{ padding: "16px 24px", fontSize: "var(--text-label-sm)", letterSpacing: "var(--ls-label-sm)", textTransform: "uppercase", textAlign: isRtl ? "right" : "left" }}>{t("labels.table.barcodeType")}</th>
                          <th style={{ padding: "16px 24px", fontSize: "var(--text-label-sm)", letterSpacing: "var(--ls-label-sm)", textTransform: "uppercase", textAlign: isRtl ? "right" : "left" }}>{t("labels.table.printedAt")}</th>
                          <th style={{ padding: "16px 24px", fontSize: "var(--text-label-sm)", letterSpacing: "var(--ls-label-sm)", textTransform: "uppercase", textAlign: isRtl ? "right" : "left" }}>{t("labels.table.user")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((log) => (
                          <tr
                            key={log.id}
                            style={{ borderBottom: "1px solid rgba(208,197,175,0.15)" }}
                            className="hover:bg-zinc-50 dark:hover:bg-zinc-850"
                          >
                            <td style={{ padding: "16px 24px", fontWeight: "bold", color: "var(--color-on-surface)" }}>
                              {log.product?.name || `Produit #${log.productId}`}
                            </td>
                            <td style={{ padding: "16px 24px", fontFamily: "monospace", color: "var(--color-outline)" }}>{log.product?.sku || "—"}</td>
                            <td style={{ padding: "16px 24px", textAlign: "center", fontWeight: "bold" }}>{log.quantity}</td>
                            <td style={{ padding: "16px 24px" }}>
                              <Badge variant="default">
                                {t(`labels.formats.${log.format}`)}
                              </Badge>
                            </td>
                            <td style={{ padding: "16px 24px", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-secondary)" }}>
                              {log.barcodeType}
                            </td>
                            <td style={{ padding: "16px 24px", color: "var(--color-on-surface-variant)" }}>
                              {new Date(log.printedAt).toLocaleString("fr-DZ")}
                            </td>
                            <td style={{ padding: "16px 24px", color: "var(--color-on-surface-variant)" }}>
                              {log.user?.name || `Utilisateur #${log.userId}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination footer */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "var(--text-body-sm)",
                      color: "var(--color-outline)",
                      paddingTop: "8px",
                      flexDirection: isRtl ? "row-reverse" : "row",
                    }}
                  >
                    <span>Total: {historyTotal} entrée(s)</span>
                    <div style={{ display: "flex", gap: "8px", flexDirection: isRtl ? "row-reverse" : "row" }}>
                      <button
                        disabled={historyPage === 1}
                        onClick={() => setHistoryPage((p) => p - 1)}
                        style={{
                          height: "36px",
                          padding: "0 16px",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--color-outline-variant)",
                          background: historyPage === 1 ? "transparent" : "var(--color-surface)",
                          color: historyPage === 1 ? "var(--color-outline)" : "var(--color-on-surface)",
                          fontSize: "var(--text-body-sm)",
                          fontWeight: 600,
                          cursor: historyPage === 1 ? "default" : "pointer",
                          opacity: historyPage === 1 ? 0.5 : 1,
                          transition: "all 0.2s ease",
                        }}
                        className={historyPage === 1 ? "" : "hover:bg-zinc-50 dark:hover:bg-zinc-850"}
                      >
                        Précédent
                      </button>
                      <button
                        disabled={historyPage * 15 >= historyTotal}
                        onClick={() => setHistoryPage((p) => p + 1)}
                        style={{
                          height: "36px",
                          padding: "0 16px",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--color-outline-variant)",
                          background: historyPage * 15 >= historyTotal ? "transparent" : "var(--color-surface)",
                          color: historyPage * 15 >= historyTotal ? "var(--color-outline)" : "var(--color-on-surface)",
                          fontSize: "var(--text-body-sm)",
                          fontWeight: 600,
                          cursor: historyPage * 15 >= historyTotal ? "default" : "pointer",
                          opacity: historyPage * 15 >= historyTotal ? 0.5 : 1,
                          transition: "all 0.2s ease",
                        }}
                        className={historyPage * 15 >= historyTotal ? "" : "hover:bg-zinc-50 dark:hover:bg-zinc-850"}
                      >
                        Suivant
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* SINGLE PRINT CONFIG MODAL */}
      <LabelPrintModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
          setSelectedVar(null);
          loadStats(); // refresh stats in case of printing
        }}
        product={selectedProduct}
        selectedVariant={selectedVar}
      />
    </div>
  );
}
