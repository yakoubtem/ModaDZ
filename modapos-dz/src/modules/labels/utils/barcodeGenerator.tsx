import React, { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";

interface BarcodeRendererProps {
  value: string;
  type: string; // "auto" | "ean13" | "qr" | "custom"
  width?: number;
  height?: number;
  displayValue?: boolean;
}

export const BarcodeRenderer: React.FC<BarcodeRendererProps> = ({
  value,
  type,
  width = 1.5,
  height = 40,
  displayValue = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [qrSvg, setQrSvg] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!value) return;
    setError("");

    if (type === "qr") {
      QRCode.toString(
        value,
        {
          type: "svg",
          margin: 1,
          width: height * 1.5,
        },
        (err, svgString) => {
          if (err) {
            setError("QR Generation failed");
            console.error(err);
          } else {
            setQrSvg(svgString);
          }
        }
      );
    } else {
      try {
        const format = type === "ean13" ? "EAN13" : "CODE128";
        
        // EAN13 validation: must be numeric and 12/13 digits
        if (format === "EAN13") {
          const cleanVal = value.replace(/[^0-9]/g, "");
          if (cleanVal.length !== 12 && cleanVal.length !== 13) {
            setError("EAN13 requis 12/13 chiffres");
            return;
          }
        }

        if (svgRef.current) {
          JsBarcode(svgRef.current, value, {
            format,
            width,
            height,
            displayValue,
            margin: 5,
            fontSize: 12,
            fontOptions: "bold",
          });
        }
      } catch (err: any) {
        setError("Erreur de rendu");
        console.error("Barcode rendering error:", err);
      }
    }
  }, [value, type, width, height, displayValue]);

  if (error) {
    return <span className="text-red-500 text-xs font-mono">{error}</span>;
  }

  if (type === "qr") {
    return (
      <div
        className="flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: qrSvg }}
      />
    );
  }

  return <svg ref={svgRef} className="mx-auto max-w-full" />;
};
