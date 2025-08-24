"use client";
import { useRef, useState } from "react";
import { Alert, Button, ButtonGroup, Container, Form } from "react-bootstrap";
import { addFormToDatabase } from "@/lib/services/suggestions";
import { useAuth } from "@/hooks/useAuth";

export default function SuggestionsFormPage() {
  const categoryRef = useRef<HTMLSelectElement>(null);
  const CCategoryRef = useRef<HTMLInputElement>(null);
  const enquiryRef = useRef<HTMLTextAreaElement>(null);
  const anonRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const [viewCustomCategory, setViewCustomCategory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);

  function handleFormChange() {
    if (categoryRef.current?.value === "Other") setViewCustomCategory(true); else setViewCustomCategory(false);
  }
  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault(); if (!user) return;
    setLoading(true);
    try {
      await addFormToDatabase(categoryRef.current!.value, enquiryRef.current!.value, anonRef.current!.checked, user);
      setPending(true);
    } catch (err) { console.log(err); }
    setLoading(false);
  }
  return (
    <Container className="p-2 bg-body-secondary">
      {pending ? (
        <Alert variant="dark" className="text-center"><b>Form submitted.</b><br />Find your submitted forms in profile page</Alert>
      ) : (
        <>
          <h4>Send us what you have in mind.</h4>
          <Form className="p-3" onSubmit={handleFormSubmit}>
            <Form.Group className="p-2">
              <Form.Label>Select Category:</Form.Label>
              <Form.Select ref={categoryRef} onChange={handleFormChange}>
                <option value="General">General enquiry</option>
                <option value="Feature request">Feature request</option>
                <option value="Collaboration">Collaboration request</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>
            {viewCustomCategory && (
              <Form.Group className="p-2">
                <Form.Label>Custom category :</Form.Label>
                <Form.Control type="text" ref={CCategoryRef} />
              </Form.Group>
            )}
            <Form.Group className="p-2">
              <Form.Label>Your enquiry</Form.Label>
              <Form.Control as="textarea" rows={5} ref={enquiryRef} />
            </Form.Group>
            <Form.Group className="p-2">
              <Form.Check name="Anon" label="Stay anonymous" ref={anonRef} />
            </Form.Group>
            <ButtonGroup className="d-flex p-2">
              <Button disabled={loading} variant="primary" className="m-1" type="submit">Submit</Button>
              <Button disabled={loading} variant="warning" className="m-1" type="reset">Clear</Button>
            </ButtonGroup>
          </Form>
        </>
      )}
    </Container>
  );
}
