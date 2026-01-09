"use client";
import { PropsWithChildren, ReactNode } from "react";
import { Container, type ContainerProps } from "react-bootstrap";
import TourneyHero, {
  type TourneyBreadcrumb,
  type TourneyHeroAction,
  type TourneyHeroBadge,
} from "./TourneyHero";

type TourneyPageProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  breadcrumbs: TourneyBreadcrumb[];
  badges?: TourneyHeroBadge[];
  actions?: TourneyHeroAction[];
  accent?: "primary" | "secondary" | "success" | "warning" | "info";
  extraHeader?: ReactNode;
  containerProps?: ContainerProps;
}>;

export default function TourneyPage({
  title,
  subtitle,
  breadcrumbs,
  badges,
  actions,
  accent,
  extraHeader,
  containerProps,
  children,
}: TourneyPageProps) {
  const contentProps: ContainerProps = {
    className: "py-4",
    ...containerProps,
  };

  if (containerProps?.className) {
    contentProps.className = `${containerProps.className}`;
  }

  return (
    <>
      <TourneyHero
        title={title}
        subtitle={subtitle}
        breadcrumbs={breadcrumbs}
        badges={badges}
        actions={actions}
        accent={accent}
        extra={extraHeader}
      />
      <Container {...contentProps}>{children}</Container>
    </>
  );
}
