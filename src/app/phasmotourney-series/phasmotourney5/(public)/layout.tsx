import React from "react";
import Tourney5SubNav from "../../../../components/tourney5/Tourney5SubNav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header>
        <h1>Phasmo Tourney 5</h1>
      </header>
      <Tourney5SubNav />
      <main>{children}</main>
    </div>
  );
}
