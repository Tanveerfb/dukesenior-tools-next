import Image from "next/image";
import React from "react";

export interface LightboxProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  lightboxSrc: string | null;
  lightboxAlt: string | null;
  gallery: { src: string; alt: string }[];
  currentIndex: number;
  gotoPrev: () => void;
  gotoNext: () => void;
}

export default function Lightbox({
  open,
  setOpen,
  lightboxSrc,
  lightboxAlt,
  gallery,
  currentIndex,
  gotoPrev,
  gotoNext,
}: LightboxProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={() => setOpen(false)}
      aria-label="Image viewer"
    >
      <div
        className="relative bg-card dark:bg-card-dark rounded-xl shadow-2xl max-w-4xl w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-border-dark">
          <h6 className="text-foreground font-semibold truncate m-0">
            {lightboxAlt || ""}
          </h6>
          <button
            className="text-foreground-secondary hover:text-foreground text-xl leading-none"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {/* Body */}
        <div className="relative flex items-center justify-center bg-black">
          {lightboxSrc && (
            <Image
              src={lightboxSrc}
              alt={lightboxAlt || ""}
              width={1200}
              height={800}
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                width: "auto",
                height: "auto",
              }}
              unoptimized
            />
          )}

          {/* Prev button */}
          {gallery.length > 1 && (
            <button
              aria-label="Previous image"
              onClick={gotoPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white px-2.5 py-2 rounded-md transition-colors"
            >
              ◀
            </button>
          )}

          {/* Next button */}
          {gallery.length > 1 && (
            <button
              aria-label="Next image"
              onClick={gotoNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white px-2.5 py-2 rounded-md transition-colors"
            >
              ▶
            </button>
          )}
        </div>
        {/* Footer */}
        {gallery.length > 0 && (
          <div className="flex justify-center py-2 border-t border-border dark:border-border-dark">
            <span className="text-sm text-foreground-secondary">
              {currentIndex + 1} / {gallery.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
