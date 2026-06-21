"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import { FaTwitch } from "react-icons/fa";
import { cn } from "@/lib/utils";
import {
  estimateReadTime,
  renderContent,
  sanitizeSchema,
  copyToClipboard,
} from "./helpers";
import styles from "./post.module.css";

interface PostArticleProps {
  post: any;
  debugRaw?: boolean;
  openLightbox: (src?: string | null, alt?: string | null) => void;
}

export default function PostArticle({
  post,
  debugRaw,
  openLightbox,
}: PostArticleProps) {
  const [copied, setCopied] = useState(false);
  const readTime = estimateReadTime(post?.content || "");

  const memoizedMarkdown = useMemo(
    () => renderContent(post?.content || ""),
    [post?.content],
  );

  return (
    <div className={cn("lg:w-2/3", styles.contentColumn)}>
      {/* Tags row */}
      <div className="mb-3 flex flex-wrap gap-2 items-center">
        {post.tags?.map((t: string) => (
          <span
            key={t}
            className="rounded-full bg-cyan-500 text-white px-2 py-0.5 text-xs font-medium mr-2"
          >
            {t}
          </span>
        ))}
        {post.pinned && (
          <span className="rounded-full bg-yellow-400 text-yellow-900 px-2 py-0.5 text-xs font-medium">
            Pinned
          </span>
        )}
        <div className="ml-auto text-sm text-foreground-secondary">
          {new Date(post.createdAt).toLocaleString()}
        </div>
      </div>

      {/* Title */}
      <h1 className="text-foreground text-3xl font-bold mb-2">
        {post.title}{" "}
        {post.id?.startsWith("sample-") && (
          <span className="ml-2 rounded-full bg-gray-500 text-white px-2 py-0.5 text-xs font-medium align-middle">
            Sample
          </span>
        )}
      </h1>
      <div className="text-foreground-secondary text-sm mb-3">
        {post.author || "DukeSenior"} &bull; {readTime} min read
      </div>

      {/* Article body */}
      <div className="mb-10" id="article-markdown">
        {debugRaw && <DebugRawContent content={post.content} />}
        <div className="markdown-body">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[
              rehypeRaw,
              [rehypeSanitize, sanitizeSchema],
              rehypeSlug,
            ]}
            components={{
              h2: ({ node: _node, ...props }) =>
                (
                  <h2 {...props}>
                    {props.children}
                    <a
                      className={styles.headingAnchor}
                      href={`#${(props.children as any)
                        .toString()
                        .toLowerCase()
                        .replace(/[^a-z0-9\- ]/g, "")
                        .replace(/\s+/g, "-")}`}
                      onClick={(e) => {
                        e.preventDefault();
                        copyToClipboard(
                          window.location.href.split("#")[0] +
                            "#" +
                            (props.children as any)
                              .toString()
                              .toLowerCase()
                              .replace(/[^a-z0-9\- ]/g, "")
                              .replace(/\s+/g, "-"),
                        );
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1200);
                      }}
                    >
                      🔗
                    </a>
                  </h2>
                ) as any,
              a: ({ node: _node, ...props }: any) => {
                const href = props.href as string | undefined;
                const className = props.className as string | undefined;
                if (className?.includes("twitch-link")) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={props.className}
                    >
                      <FaTwitch style={{ marginRight: 8 }} />
                      <span>{props.children}</span>
                    </a>
                  );
                }
                return <a {...props} />;
              },
              img: (props: any) => {
                const src = props.src as string;
                const alt = props.alt as string | undefined;
                return (
                  <span
                    role="button"
                    tabIndex={0}
                    style={{ display: "block", cursor: "pointer" }}
                    onClick={() => openLightbox(src, alt || "")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") openLightbox(src, alt || "");
                    }}
                  >
                    <Image
                      src={src}
                      alt={alt || "image"}
                      width={640}
                      height={400}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "480px",
                        width: "auto",
                        height: "auto",
                        borderRadius: "8px",
                      }}
                      unoptimized
                    />
                  </span>
                );
              },
            }}
          >
            {memoizedMarkdown}
          </ReactMarkdown>
        </div>
      </div>

      {/* Copied toast */}
      {copied && (
        <div className="fixed right-4 bottom-4 bg-black/70 text-white px-3 py-1.5 rounded-md text-sm z-50">
          Link copied!
        </div>
      )}
    </div>
  );
}

function DebugRawContent({ content }: { content?: string }) {
  return (
    <div className="mb-3">
      <strong>Debug: raw stored content preview</strong>
      <pre className="max-h-40 overflow-auto bg-gray-100 dark:bg-gray-800 p-2 rounded">
        {String(content || "").slice(0, 1000)}
      </pre>
      <div className="mt-2">
        <strong>Debug (JSON.stringify)</strong>
        <pre className="max-h-40 overflow-auto bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
          {JSON.stringify(content)}
        </pre>
      </div>
      <div className="mt-2">
        <strong>Minimal render (remark-gfm only)</strong>
        <div className="p-2 border border-border dark:border-border-dark rounded bg-gray-50 dark:bg-gray-800 max-h-56 overflow-auto">
          {String(content || "").trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {String(content || "")}
            </ReactMarkdown>
          ) : (
            <div>(empty)</div>
          )}
        </div>
      </div>
    </div>
  );
}
