"use client";
import { useRef, useState } from "react";
import { Button, ButtonGroup, Container, Form } from "react-bootstrap";
import { getAIResponse } from "@/lib/ai/gemini";
import ReactMarkdown from "react-markdown";
import { FaCopy } from "react-icons/fa";

export default function GeminiAIPage() {
  const query = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("Get a response by asking a question...");
  async function handleAI(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (query.current?.value) {
        const data = await getAIResponse(query.current.value);
        setResponse(data);
        query.current.value = "";
      }
    } catch (err) { console.log(err); }
    setLoading(false);
  }
  return (
    <Container fluid className="py-3 bg-light bg-opacity-25">
      <h4 className="p-1">Try the integrated Gemini AI!</h4>
      <ButtonGroup className="d-flex p-2">
        {response !== "Get a response by asking a question..." && (
          <Button onClick={() => navigator.clipboard.writeText(response)}><FaCopy />&nbsp;Copy</Button>
        )}
      </ButtonGroup>
      <div className="p-3 AIBox bg-dark bg-opacity-50 text-white">
        <ReactMarkdown>{response}</ReactMarkdown>
      </div>
      <Form onSubmit={handleAI}>
        <Form.Group className="p-1 my-1">
          <Form.Control as="textarea" rows={3} placeholder="Enter your query here." ref={query} />
        </Form.Group>
        <ButtonGroup className="d-flex p-1">
          <Button type="submit" disabled={loading} variant={loading ? "warning" : "success"} className="m-1">{loading ? "Loading..." : "Generate"}</Button>
        </ButtonGroup>
      </Form>
    </Container>
  );
}

