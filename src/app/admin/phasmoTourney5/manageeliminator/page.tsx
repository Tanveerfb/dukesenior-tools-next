"use client";
import { Container } from "react-bootstrap";
import EliminatorCard from "@/components/tourney/EliminatorCard";

export default function ManageEliminatorPage() {
  return (
    <Container className="py-4">
      <h1 className="h4 fw-semibold mb-3">Manage Eliminator</h1>
      <EliminatorCard />
    </Container>
  );
}
