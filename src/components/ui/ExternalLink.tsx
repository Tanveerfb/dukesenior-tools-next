import React from 'react';

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: React.ReactNode;
  href: string;
};

export default function ExternalLink({ href, children, target = '_blank', rel, ...rest }: Props) {
  const safeRel = rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined);
  return (
    <a href={href} target={target} rel={safeRel} {...rest}>
      {children}
    </a>
  );
}
