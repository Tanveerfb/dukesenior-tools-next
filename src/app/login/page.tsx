"use client";
import { useState, useRef } from "react";
import { Alert, Button, ButtonGroup, Col, Container, Form, Row } from "react-bootstrap";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const { login, signup } = useAuth();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [signupForm, setSignupForm] = useState(false);
  const router = useRouter();

  function changeForm(e: React.MouseEvent) {
    e.preventDefault();
    setSignupForm(f => !f);
  }
  async function handleForm(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const email = emailRef.current!.value;
      const pass = passwordRef.current!.value;
      if (signupForm) await signup(email, pass); else await login(email, pass);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Auth failed");
      setLoading(false);
    }
  }
  return (
    <Container>
      <Alert className="text-center">{signupForm ? "Create an account with us" : "Enter your details to login to the website"}</Alert>
      <Form onSubmit={handleForm}>
        <Container className="mb-3">
          <Row className="align-items-center">
            <Col xs="2"><Form.Label>Email: </Form.Label></Col>
            <Col lg><Form.Control type="email" required placeholder="A valid email address" ref={emailRef} /></Col>
          </Row>
        </Container>
        <Container className="mb-3">
          <Row className="align-items-center">
            <Col xs="2"><Form.Label>Password: </Form.Label></Col>
            <Col lg><Form.Control type="password" required placeholder="Minimum 8 length" minLength={8} ref={passwordRef} /></Col>
          </Row>
        </Container>
        <ButtonGroup className="d-flex mb-3">
          <Button disabled={loading} type="submit" variant="primary" className="mx-1">{signupForm ? "Create account" : "Login"}</Button>
          <Button disabled={loading} type="reset" variant="secondary" className="mx-1">Clear</Button>
        </ButtonGroup>
      </Form>
      <Container>
        <Alert>
          {signupForm ? (<span>Already have an account with us? <a href="#" onClick={changeForm}>Click here</a></span>) : (<span>Don't have an account yet? <a href="#" onClick={changeForm}>Click here</a></span>)}
        </Alert>
      </Container>
      {error && <Alert variant="danger">{error}</Alert>}
    </Container>
  );
}

