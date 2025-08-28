"use client";

import React from 'react';
import Link, { LinkProps } from 'next/link';

// Allow passing anchor props (className, onClick, aria-*, etc.) in addition to Next's LinkProps.
type CombinedProps = LinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement> & { children?: React.ReactNode };

// Shared forwardRef wrapper so React-Bootstrap components can use
// `as={InlineLink}` without TypeScript ref-errors, and so it can be used as a direct component.
const InlineLink = React.forwardRef<HTMLAnchorElement, CombinedProps>(function InlineLink(props, ref) {
  const { children, href, ...rest } = props as CombinedProps;
  // Next's Link accepts href of various types; pass through other anchor props via legacyBehavior wrapper.
  return (
    <Link href={href as LinkProps['href']} ref={ref} legacyBehavior>
      <a {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    </Link>
  );
});

export default InlineLink;
