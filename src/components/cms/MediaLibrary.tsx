"use client";
import React, { useState } from "react";
import {
  Modal,
  Button,
  Form,
  Card,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  type: string;
  size: number;
  uploadedAt: number;
}

interface MediaLibraryProps {
  show: boolean;
  onHide: () => void;
  onSelect?: (url: string) => void;
}

export default function MediaLibrary({
  show,
  onHide,
  onSelect,
}: MediaLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);

  // This is a placeholder implementation
  // In a full implementation, you would:
  // 1. Fetch media items from Firestore
  // 2. Implement search/filter functionality
  // 3. Add upload functionality
  // 4. Add delete functionality

  const filteredItems = items.filter((item) =>
    item.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Media Library</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Form.Group>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center text-muted py-5">
            <p>No media items found.</p>
            <p className="small">
              Media library integration coming soon. For now, use the upload
              button in the post editor.
            </p>
          </div>
        ) : (
          <Row>
            {filteredItems.map((item) => (
              <Col key={item.id} md={3} className="mb-3">
                <Card
                  onClick={() => onSelect && onSelect(item.url)}
                  style={{ cursor: "pointer" }}
                >
                  <Card.Img
                    variant="top"
                    src={item.url}
                    alt={item.filename}
                    style={{ height: 150, objectFit: "cover" }}
                  />
                  <Card.Body>
                    <Card.Text className="small text-truncate">
                      {item.filename}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
