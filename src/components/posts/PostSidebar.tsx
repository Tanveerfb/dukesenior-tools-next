"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { extractHeadings, copyToClipboard } from "./helpers";
import styles from "./post.module.css";

interface PostSidebarProps {
  post: any;
  openLightbox: (src?: string | null, alt?: string | null) => void;
}

export default function PostSidebar({ post, openLightbox }: PostSidebarProps) {
  const headings = extractHeadings(post?.content || "");

  return (
    <div className={cn("lg:w-1/3", styles.sidebar)}>
      <div className={styles.stickySidebar}>
        {/* Banner preview */}
        {post.bannerUrl && (
          <div
            className={styles.bannerPreview}
            style={{ position: "relative" }}
          >
            <div
              role="button"
              style={{ cursor: "pointer" }}
              onClick={() => openLightbox(post.bannerUrl, post.title)}
            >
              <Image
                src={post.bannerUrl}
                alt={post.title}
                width={1200}
                height={600}
                style={{ width: "100%", height: "auto" }}
                unoptimized
              />
            </div>
          </div>
        )}

        {/* Table of contents */}
        <div className="rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark shadow-sm mb-3 p-4">
          <h6 className="text-foreground font-semibold mb-2">On this page</h6>
          <ul className={styles.tocList}>
            {headings.map((h) => (
              <li key={h.id} style={{ marginLeft: (h.level - 1) * 8 }}>
                <a className={styles.tocLink} href={`#${h.id}`}>
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Share */}
        <div className="rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark shadow-sm p-4">
          <h6 className="text-foreground font-semibold mb-2">Share</h6>
          <div className="flex gap-2">
            <button
              className="rounded-lg border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white px-3 py-1.5 text-sm font-medium transition-colors"
              onClick={() => copyToClipboard(window.location.href)}
            >
              Copy link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
