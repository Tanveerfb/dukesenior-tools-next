"use client";
import { useState } from "react";
import { Container, Row, Col, Button, Alert, Card, Form, Badge, Table } from "react-bootstrap";
import { useTheme } from '@/components/ThemeProvider';

export default function StyleCheckPage(){
  const { theme, toggleTheme, increaseFont, decreaseFont, resetFont, fontScale } = useTheme();
  const [showAlert,setShowAlert] = useState(true);
  return (
    <Container className="py-5">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <strong>Accessibility / Quick A11y</strong>
          <div className="small text-muted">Theme: {theme} — Scale: {Math.round(fontScale*100)}%</div>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <Button size="sm" variant="outline-secondary" onClick={decreaseFont}>A-</Button>
          <Button size="sm" variant="outline-secondary" onClick={resetFont}>A</Button>
          <Button size="sm" variant="outline-secondary" onClick={increaseFont}>A+</Button>
          <Button size="sm" variant="secondary" onClick={toggleTheme}>{theme==='light' ? 'Dark' : 'Light'}</Button>
        </div>
      </div>

      <h2 className="mb-3">Style check</h2>
      <Row className="g-3">
        <Col md={6}>
          <Card className="p-3">
            <h5>Buttons</h5>
            <div className="d-flex gap-2 flex-wrap mb-2">
              <Button>Default</Button>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="danger">Danger</Button>
            </div>
            <div className="d-flex gap-2 flex-wrap mb-2">
              <Button variant="outline-primary">Outline Primary</Button>
              <Button variant="outline-secondary">Outline Secondary</Button>
              <Button variant="outline-success">Outline Success</Button>
              <Button variant="outline-warning">Outline Warning</Button>
              <Button variant="outline-danger">Outline Danger</Button>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <Button size="sm" variant="primary">Small</Button>
              <Button variant="primary">Normal</Button>
              <Button size="lg" variant="primary">Large</Button>
            </div>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="p-3">
            <h5>Alerts</h5>
            {showAlert && <Alert variant="info" dismissible onClose={()=> setShowAlert(false)}>This is an informational alert. Try theme toggle.</Alert>}
            <Alert variant="primary">Primary alert</Alert>
            <Alert variant="secondary">Secondary alert</Alert>
            <Alert variant="success">Success alert</Alert>
            <Alert variant="danger">Danger alert</Alert>
            <Alert variant="warning">Warning alert</Alert>
            <Alert variant="info">Info alert</Alert>
            <Alert variant="light">Light alert</Alert>
            <Alert variant="dark">Dark alert</Alert>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="p-3">
            <h5>Form</h5>
            <Form>
              <Form.Group className="mb-2"><Form.Label>Email</Form.Label><Form.Control type="email" placeholder="name@example.com" /></Form.Group>
              <Form.Group className="mb-2"><Form.Label>Password</Form.Label><Form.Control type="password" placeholder="••••••" /></Form.Group>
              <Form.Group className="mb-2"><Form.Label>Textarea</Form.Label><Form.Control as="textarea" rows={3} placeholder="Multi-line text" /></Form.Group>
              <Form.Group className="mb-2"><Form.Check type="checkbox" label="Remember me" /></Form.Group>
              <div className="d-flex gap-2"><Button type="submit">Submit</Button><Button variant="secondary">Cancel</Button></div>
            </Form>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="p-3">
            <h5>Badges & Cards</h5>
            <div className="mb-2">
              <Badge bg="primary" className="me-1">Primary</Badge>
              <Badge bg="secondary" className="me-1">Secondary</Badge>
              <Badge bg="success" className="me-1">Success</Badge>
              <Badge bg="warning" text="dark" className="me-1">Warning</Badge>
              <Badge bg="danger" className="me-1">Danger</Badge>
              <Badge bg="info" text="dark" className="me-1">Info</Badge>
              <Badge bg="light" text="dark" className="me-1">Light</Badge>
              <Badge bg="dark" className="me-1">Dark</Badge>
            </div>
            <Card body>Card body content with <strong>strong</strong> and <em>emphasis</em>.</Card>
          </Card>
        </Col>
        <Col md={12}>
          <Card className="p-3">
            <h5>Headings & Typography</h5>
            <div className="mb-3">
              <h1>h1. Heading</h1>
              <h2>h2. Heading</h2>
              <h3>h3. Heading</h3>
              <h4>h4. Heading</h4>
              <h5>h5. Heading</h5>
              <h6>h6. Heading</h6>
            </div>
            <h5>Tables</h5>
            <Table striped bordered hover responsive>
              <thead><tr><th>#</th><th>Name</th><th>Role</th><th>Active</th></tr></thead>
              <tbody>
                <tr><td>1</td><td>Sample User</td><td>Admin</td><td>Yes</td></tr>
                <tr><td>2</td><td>Another</td><td>Editor</td><td>No</td></tr>
                <tr><td>3</td><td>Visitor</td><td>Viewer</td><td>No</td></tr>
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
