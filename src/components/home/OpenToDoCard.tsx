import { useRouter } from 'next/navigation';
import React from 'react';
import { Card, Button } from 'react-bootstrap';

export default function OpenToDoCard({ className }: { className?: string }){
  const router = useRouter();
  return (
    <Card className={className || 'mb-3'}>
      <Card.Header className="fw-semibold">To‑Do</Card.Header>
      <Card.Body>
        <div className="small text-muted mb-2">Quick access to your tasks and task management.</div>
        <div className="d-flex">
          <Button onClick={()=> router.push('/todolist')} className="ms-auto">Open To‑Do list</Button>
        </div>
      </Card.Body>
    </Card>
  );
}
