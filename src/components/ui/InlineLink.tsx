"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { LinkProps } from "next/link";

// Allow passing anchor props (className, onClick, aria-*, etc.) in addition to Next's LinkProps.
type CombinedProps = LinkProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children?: React.ReactNode;
  };

// Shared forwardRef wrapper so React-Bootstrap components can use
// `as={InlineLink}` without TypeScript ref-errors, and so it can be used as a direct component.
const InlineLink = React.forwardRef<HTMLAnchorElement, CombinedProps>(
  function InlineLink(props, ref) {
    const { children, href, onClick, target, rel, ...rest } =
      props as CombinedProps;
    const router = useRouter();

    const toStringHref = useCallback((h: LinkProps["href"]) => {
      if (!h) return "";
      if (typeof h === "string") return h;
      // handle URL object-like shapes
      try {
        const pathname = (h as any).pathname || "";
        const search = (h as any).search || "";
        return `${pathname}${search}`;
      } catch {
        return String(h);
      }
    }, []);

    const url = toStringHref(href as LinkProps["href"]);

    const isExternal = /^(https?:)?\/\//i.test(url) || url.includes(":");

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (onClick) onClick(e as any);
        if (e.defaultPrevented) return;
        // allow modifier keys / middle click / target=_blank to behave normally
        if (
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey ||
          (e.button && e.button !== 0)
        )
          return;
        if (target === "_blank" || isExternal) return; // let browser handle external/new-tab links
        e.preventDefault();
        try {
          router.push(url);
        } catch (_err) {
          window.location.href = url;
        }
      },
      [onClick, router, url, target, isExternal]
    );

    return (
      <a
        ref={ref}
        href={url}
        onClick={handleClick}
        target={target}
        rel={rel}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }
);

export default InlineLink;
