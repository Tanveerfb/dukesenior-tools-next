"use client";

import React from "react";
import { useAuth } from "../../../../../hooks/useAuth";
import Tourney5AdminNav from "../../../../../components/tourney5/Tourney5AdminNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, admin } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!admin) return <div>Unauthorized</div>;
  return (
    <div>
      <header>
        <h2>Tourney 5 Admin</h2>
      </header>
      <Tourney5AdminNav />
      <main>{children}</main>
    </div>
  );
}
