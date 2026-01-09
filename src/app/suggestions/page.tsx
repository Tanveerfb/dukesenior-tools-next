"use client";
import React, { useState } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { useAuth } from '@/hooks/useAuth';
import { addFormToDatabase } from '@/lib/services/suggestions';

export default function SuggestionsPage(){
  const { user } = useAuth();
  const [msg, setMsg] = useState('');
  const [anon, setAnon] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e?: React.FormEvent){
    e?.preventDefault();
    if(!msg.trim()) return;
    setSending(true);
    try{
      await addFormToDatabase('public-suggestions', msg.trim(), anon, user);
      setSent(true); setMsg('');
    }catch(err){ console.error(err); }
    setSending(false);
    setTimeout(()=> setSent(false), 3000);
  }

  return (
    <Container className="py-4">
      <Card>
        <Card.Header className="fw-semibold">Send a suggestion</Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Your suggestion</Form.Label>
              <Form.Control as="textarea" rows={4} value={msg} onChange={e=>setMsg(e.target.value)} maxLength={1000} />
            </Form.Group>

            <div className="d-flex gap-2 mt-3">
              <Form.Check type="checkbox" label="Submit anonymously" checked={anon} onChange={e=>setAnon(e.target.checked)} />
              <Button className="ms-auto" type="submit" disabled={sending || (!anon && !user)}>{sending? 'Sending...':'Send'}</Button>
            </div>

            {sent && <div className="small text-success mt-2">Thanks — suggestion sent.</div>}
            {!anon && !user && <div className="small text-muted mt-2">Sign in to send suggestions without anonymous flag.</div>}
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
