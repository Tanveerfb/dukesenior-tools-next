import { useState, useEffect, useCallback } from "react";

export interface GalleryItem {
  src: string;
  alt: string;
}

export interface UseLightboxReturn {
  lightboxOpen: boolean;
  lightboxSrc: string | null;
  lightboxAlt: string | null;
  gallery: GalleryItem[];
  currentIndex: number;
  openLightbox: (src?: string | null, alt?: string | null) => void;
  closeLightbox: () => void;
  gotoPrev: () => void;
  gotoNext: () => void;
  setGallery: React.Dispatch<React.SetStateAction<GalleryItem[]>>;
}

export function useLightbox(): UseLightboxReturn {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const openLightboxByIndex = useCallback(
    (index: number) => {
      const it = gallery[index];
      if (!it) return;
      setCurrentIndex(index);
      setLightboxSrc(it.src);
      setLightboxAlt(it.alt);
      setLightboxOpen(true);
    },
    [gallery],
  );

  const openLightbox = useCallback(
    (src?: string | null, alt?: string | null) => {
      if (!src) return;
      const idx = gallery.findIndex((g) => g.src === src);
      if (idx >= 0) {
        openLightboxByIndex(idx);
        return;
      }
      // add to gallery on-the-fly
      setGallery((prev) => {
        const next = [...prev, { src, alt: alt || "" }];
        const newIndex = next.length - 1;
        setCurrentIndex(newIndex);
        setLightboxSrc(src);
        setLightboxAlt(alt || "");
        setLightboxOpen(true);
        return next;
      });
    },
    [gallery, openLightboxByIndex],
  );

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const gotoPrev = useCallback(() => {
    if (gallery.length === 0) return;
    const next = (currentIndex - 1 + gallery.length) % gallery.length;
    openLightboxByIndex(next);
  }, [gallery, currentIndex, openLightboxByIndex]);

  const gotoNext = useCallback(() => {
    if (gallery.length === 0) return;
    const next = (currentIndex + 1) % gallery.length;
    openLightboxByIndex(next);
  }, [gallery, currentIndex, openLightboxByIndex]);

  // keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      else if (e.key === "ArrowLeft") gotoPrev();
      else if (e.key === "ArrowRight") gotoNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, gotoPrev, gotoNext]);

  return {
    lightboxOpen,
    lightboxSrc,
    lightboxAlt,
    gallery,
    currentIndex,
    openLightbox,
    closeLightbox,
    gotoPrev,
    gotoNext,
    setGallery,
  };
}

/** Build a deduplicated image gallery from post banner + markdown/html images */
export function buildGalleryFromPost(post: {
  bannerUrl?: string;
  title?: string;
  content?: string;
}): GalleryItem[] {
  const items: GalleryItem[] = [];
  if (post.bannerUrl)
    items.push({ src: post.bannerUrl, alt: post.title || "" });

  const md = post.content || "";
  const mdImgRe = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = mdImgRe.exec(md))) {
    items.push({ src: m[2], alt: m[1] || "" });
  }
  const htmlImgRe = /<img[^>]+src=(?:"|')?([^"'>\s]+)(?:"|')?[^>]*>/g;
  while ((m = htmlImgRe.exec(md))) {
    items.push({ src: m[1], alt: "" });
  }

  const seen = new Set<string>();
  const dedup: GalleryItem[] = [];
  for (const it of items) {
    if (!seen.has(it.src)) {
      seen.add(it.src);
      dedup.push(it);
    }
  }
  return dedup;
}
