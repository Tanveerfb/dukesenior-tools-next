"use client";
import Link from "next/link";
import { Card } from "react-bootstrap";
import { BsCheckCircle } from "react-icons/bs";

export default function OpenToDoCard({ className }: { className?: string }) {
  return (
    <Card className={`border-0 shadow-sm ${className ?? ""}`.trim()}>
      <Card.Body>
        <div className="d-flex align-items-center gap-2 mb-3">
          <span className="badge text-bg-primary text-uppercase small">
            Tasks
          </span>
          <span className="text-muted small">Stay prepared</span>
        </div>
        <Card.Title
          as="h3"
          className="h5 fw-semibold d-flex align-items-center gap-2"
        >
          <BsCheckCircle className="text-primary" />
          To-Do workspace
        </Card.Title>
        <Card.Text className="text-muted small">
          Pin upcoming matches, assign owners, and track progress with a focused
          view of your open Phasmo Tourney tasks.
        </Card.Text>
        <Link href="/todolist" className="btn btn-primary w-100 mt-3">
          Open To-Do list
        </Link>
      </Card.Body>
    </Card>
  );
}
