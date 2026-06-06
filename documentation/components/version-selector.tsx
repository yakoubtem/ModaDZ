"use client";

import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";

const versions = ["v1.0.0 (Actuelle)", "v0.9.0 (Archive)"];

export default function VersionSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(versions[0]);

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex justify-between items-center w-40 rounded-md border border-fd-border bg-fd-background px-3 py-1.5 text-xs font-semibold text-fd-foreground hover:bg-fd-muted focus:outline-none focus:ring-1 focus:ring-fd-primary transition-all duration-200 cursor-pointer"
        >
          <span className="truncate">{selectedVersion}</span>
          <ChevronDown className="ml-1 h-3 w-3 text-fd-muted-foreground transition-transform duration-200" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)" }} />
        </button>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="origin-top-right absolute right-0 mt-1 w-40 rounded-md shadow-lg bg-fd-card border border-fd-border focus:outline-none z-40 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="py-1">
              {versions.map((version) => (
                <button
                  key={version}
                  onClick={() => {
                    setSelectedVersion(version);
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-between w-full text-left px-3 py-1.5 text-xs text-fd-foreground hover:bg-fd-muted transition-all duration-150 cursor-pointer"
                >
                  <span className={selectedVersion === version ? "font-semibold text-fd-primary" : ""}>
                    {version}
                  </span>
                  {selectedVersion === version && (
                    <Check className="h-3 w-3 text-fd-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
