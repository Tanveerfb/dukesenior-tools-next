import Link from 'next/link';
import { Container, Alert, Button } from 'react-bootstrap';

export default function NotFound(){
  return (
    <Container className="py-5 text-center">
      <Alert variant="danger" className="fw-bold fs-4">404 - Page Not Found</Alert>
      <p>The page you are looking for doesn't exist or was moved.</p>
      <Button variant="primary" className="m-2">
        <Link href="/" className="text-white text-decoration-none">Return Home</Link>
      </Button>
      <Button variant="secondary" className="m-2">
        <Link href="/todolist" className="text-white text-decoration-none">Go To Tools</Link>
      </Button>
    </Container>
  );
}
