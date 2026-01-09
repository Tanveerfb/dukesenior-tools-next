"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Stack,
  Table,
} from "react-bootstrap";
import {
  addVideoLink,
  listVideoLinks,
  deleteVideoLink,
} from "@/lib/services/phasmoTourney5";

interface VideoLink {
  id: string;
  title: string;
  url: string;
  platform: "youtube" | "twitch";
  roundId?: string;
  notes?: string;
  officer: string;
  createdAt: number;
}

export default function ManageContentLinksPage() {
  const { admin, user } = useAuth();
  const [links, setLinks] = useState<VideoLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    url: "",
    platform: "youtube" as "youtube" | "twitch",
    roundId: "",
    notes: "",
  });

  useEffect(() => {
    if (!admin) return;
    loadLinks();
  }, [admin]);

  async function loadLinks() {
    try {
      const data = await listVideoLinks();
      setLinks(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load links");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.title.trim() || !form.url.trim()) {
      setError("Title and URL are required");
      return;
    }

    setSubmitting(true);
    try {
      const officer = user?.displayName || user?.email || "Unknown";
      await addVideoLink({
        officer,
        title: form.title.trim(),
        url: form.url.trim(),
        platform: form.platform,
        roundId: form.roundId.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      setSuccess("Video link added successfully");
      setForm({
        title: "",
        url: "",
        platform: "youtube",
        roundId: "",
        notes: "",
      });
      await loadLinks();
    } catch (e: any) {
      setError(e?.message || "Failed to add video link");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(linkId: string) {
    if (!confirm("Delete this video link?")) return;
    try {
      await deleteVideoLink(linkId);
      setSuccess("Video link deleted");
      await loadLinks();
    } catch (e: any) {
      setError(e?.message || "Failed to delete link");
    }
  }

  if (!admin) {
    return (
      <Container className="py-4">
        <h1 className="h4 fw-semibold mb-3">Manage Content Links</h1>
        <Alert variant="warning">Admin access required.</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="h4 fw-semibold mb-3">Manage Video & Stream Links</h1>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Card.Title as="h2" className="h5 mb-3">
            Add New Video Link
          </Card.Title>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g., Round 1 Highlights"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Platform *</Form.Label>
                  <Form.Select
                    value={form.platform}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        platform: e.target.value as "youtube" | "twitch",
                      })
                    }
                  >
                    <option value="youtube">YouTube</option>
                    <option value="twitch">Twitch</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group>
                  <Form.Label>URL *</Form.Label>
                  <Form.Control
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=... or https://www.twitch.tv/videos/..."
                    required
                  />
                  <Form.Text className="text-muted">
                    For YouTube: Full video URL. For Twitch: Video URL (VOD).
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Round ID (Optional)</Form.Label>
                  <Form.Control
                    value={form.roundId}
                    onChange={(e) => setForm({ ...form, roundId: e.target.value })}
                    placeholder="e.g., round1"
                  />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Notes (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Any additional notes..."
                  />
                </Form.Group>
              </Col>
            </Row>
            <Stack direction="horizontal" gap={2} className="mt-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Adding..." : "Add Link"}
              </Button>
            </Stack>
          </Form>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title as="h2" className="h5 mb-3">
            Existing Links ({links.length})
          </Card.Title>
          {loading ? (
            <Alert variant="info" className="mb-0">
              Loading...
            </Alert>
          ) : links.length === 0 ? (
            <Alert variant="info" className="mb-0">
              No video links yet.
            </Alert>
          ) : (
            <Table responsive hover size="sm">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Platform</th>
                  <th>Round</th>
                  <th>URL</th>
                  <th>Added By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link.id}>
                    <td>{link.title}</td>
                    <td className="text-capitalize">{link.platform}</td>
                    <td>{link.roundId || "—"}</td>
                    <td>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="small"
                      >
                        View
                      </a>
                    </td>
                    <td className="text-muted small">{link.officer}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(link.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
