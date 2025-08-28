import React, { useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import { getAIResponse } from '@/lib/ai/gemini';

export default function GeminiMini(){
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [q, setQ] = useState('');

  async function ask(){
    if(!q.trim()) return;
    setLoading(true);
    try{ const data = await getAIResponse(q); setResponse(data); setQ(''); }catch(e){ setResponse('Error'); }
    setLoading(false);
  }

  return (
    <Card className="mb-3">
      <Card.Body>
        <div className="d-flex gap-2">
          <Form.Control placeholder="Ask something..." value={q} onChange={e=>setQ(e.target.value)} />
          <Button onClick={ask} disabled={loading}>{loading? '...' : 'Ask'}</Button>
        </div>
        {response && <div className="mt-2 small text-muted"><ReactMarkdown>{response}</ReactMarkdown></div>}
        <div className="mt-2 text-end"><a href="/GeminiAI">Open Gemini</a></div>
      </Card.Body>
    </Card>
  );
}
