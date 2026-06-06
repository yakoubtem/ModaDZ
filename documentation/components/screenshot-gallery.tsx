"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

interface Screenshot {
  src: string;
  alt: string;
  caption?: string;
}

interface ScreenshotGalleryProps {
  screenshots: Screenshot[];
}

export default function ScreenshotGallery({ screenshots }: ScreenshotGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  if (!screenshots || screenshots.length === 0) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex === null) return;
    setCurrentIndex((prev) => (prev === 0 ? screenshots.length - 1 : (prev ?? 0) - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex === null) return;
    setCurrentIndex((prev) => (prev === screenshots.length - 1 ? 0 : (prev ?? 0) + 1));
  };

  return (
    <div className="my-6">
      {/* Grid of Screenshots */}
      <div className={`grid gap-4 ${screenshots.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"}`}>
        {screenshots.map((s, idx) => (
          <div
            key={idx}
            className="group relative border border-fd-border rounded-lg overflow-hidden bg-fd-card shadow-sm hover:shadow-md hover:border-fd-primary transition-all duration-300 cursor-pointer"
            onClick={() => setCurrentIndex(idx)}
          >
            <div className="aspect-video w-full relative overflow-hidden bg-neutral-900/5 flex items-center justify-center">
              <img
                src={s.src}
                alt={s.alt}
                className="object-cover w-full h-full group-hover:scale-103 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <div className="bg-fd-background/90 text-fd-foreground rounded-full p-2.5 shadow-lg">
                  <ZoomIn className="h-4 w-4 text-fd-primary" />
                </div>
              </div>
            </div>
            {s.caption && (
              <div className="p-2.5 bg-fd-background border-t border-fd-border text-xs text-fd-muted-foreground font-medium text-center truncate">
                {s.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox / Zoom Dialog */}
      {currentIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex flex-col justify-center items-center p-4 transition-all duration-300 select-none"
          onClick={() => setCurrentIndex(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setCurrentIndex(null)}
            className="absolute top-4 right-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full p-2 transition-all cursor-pointer z-50 border border-neutral-700"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Navigation */}
          {screenshots.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full p-3 transition-all cursor-pointer z-50 border border-neutral-700"
                aria-label="Précédent"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full p-3 transition-all cursor-pointer z-50 border border-neutral-700"
                aria-label="Suivant"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Zoomed Image Container */}
          <div className="max-w-4xl max-h-[80vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={screenshots[currentIndex].src}
              alt={screenshots[currentIndex].alt}
              className="object-contain max-w-full max-h-[70vh] rounded-md shadow-2xl animate-in zoom-in-95 duration-200"
            />
            {screenshots[currentIndex].caption && (
              <p className="text-white text-xs font-semibold mt-4 text-center bg-neutral-800/80 px-4 py-2 rounded-full border border-neutral-700">
                {screenshots[currentIndex].caption}
              </p>
            )}
            <p className="text-neutral-500 text-[10px] mt-2">
              {currentIndex + 1} / {screenshots.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
