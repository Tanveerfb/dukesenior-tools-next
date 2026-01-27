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
  Badge,
} from "react-bootstrap";
import { FaYoutube, FaTwitch, FaExternalLinkAlt } from "react-icons/fa";
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

export default function ManageVideosPage() {
  const { admin, user } = useAuth();
  const [videos, setVideos] = useState<VideoLink[]>([]);
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
    loadVideos();
  }, [admin]);

  async function loadVideos() {
    try {
      const data = await listVideoLinks();
      setVideos(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load videos");
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
      setSuccess("Video added successfully! View it on the Videos page.");
      setForm({
        title: "",
        url: "",
        platform: "youtube",
        roundId: "",
        notes: "",
      });
      await loadVideos();
    } catch (e: any) {
      setError(e?.message || "Failed to add video");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(videoId: string) {
    if (!confirm("Delete this video? This action cannot be undone.")) return;
    try {
      await deleteVideoLink(videoId);
      setSuccess("Video deleted successfully");
      await loadVideos();
    } catch (e: any) {
      setError(e?.message || "Failed to delete video");
    }
  }

  if (!admin) {
    return (
      <Container className="py-4">
        <h1 className="h4 fw-semibold mb-3">Manage Videos</h1>
        <Alert variant="warning">Admin access required.</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 fw-semibold mb-0">Manage Tourney 5 Videos</h1>
        <a
          href="/phasmotourney-series/phasmoTourney5/videos"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm btn-outline-primary"
        >
          <FaExternalLinkAlt className="me-1" />
          View Videos Page
        </a>
      </div>

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
            Add New Video
          </Card.Title>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={8}>
                <Form.Group>
                  <Form.Label>
                    Video Title <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g., Round 1 Highlights - Player Name"
                    required
                  />
                  <Form.Text className="text-muted">
                    Use descriptive titles for easy identification
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>
                    Platform <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    value={form.platform}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        platform: e.target.value as "youtube" | "twitch",
                      })
                    }
                  >
                    <option value="youtube">
                      <FaYoutube /> YouTube
                    </option>
                    <option value="twitch">
                      <FaTwitch /> Twitch
                    </option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group>
                  <Form.Label>
                    Video URL <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=... or https://www.twitch.tv/videos/..."
                    required
                  />
                  <Form.Text className="text-muted">
                    {form.platform === "youtube"
                      ? "Full YouTube video URL or short link"
                      : "Twitch VOD URL (video archive link)"}
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Round (Optional)</Form.Label>
                  <Form.Select
                    value={form.roundId}
                    onChange={(e) => setForm({ ...form, roundId: e.target.value })}
                  >
                    <option value="">General</option>
                    <option value="round1">Round 1</option>
                    <option value="round2">Round 2</option>
                    <option value="round3">Round 3</option>
                    <option value="round4">Round 4</option>
                    <option value="round5">Round 5</option>
                    <option value="round6">Round 6</option>
                    <option value="round7">Round 7</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Leave as General for non-round-specific videos
                  </Form.Text>
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
                    placeholder="Add any additional context, player names, or highlights..."
                  />
                </Form.Group>
              </Col>
            </Row>
            <Stack direction="horizontal" gap={2} className="mt-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Adding..." : "Add Video"}
              </Button>
              {form.title && (
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={() =>
                    setForm({
                      title: "",
                      url: "",
                      platform: "youtube",
                      roundId: "",
                      notes: "",
                    })
                  }
                >
                  Clear
                </Button>
              )}
            </Stack>
          </Form>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title as="h2" className="h5 mb-3">
            Existing Videos ({videos.length})
          </Card.Title>
          {loading ? (
            <Alert variant="info" className="mb-0">
              Loading videos...
            </Alert>
          ) : videos.length === 0 ? (
            <Alert variant="info" className="mb-0">
              No videos added yet. Add your first video above!
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table hover size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Platform</th>
                    <th>Round</th>
                    <th>Added By</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((video) => (
                    <tr key={video.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {video.platform === "youtube" ? (
                            <FaYoutube color="#FF0000" />
                          ) : (
                            <FaTwitch color="#9147FF" />
                          )}
                          <span>{video.title}</span>
                        </div>
                      </td>
                      <td>
                        <Badge
                          bg={
                            video.platform === "youtube" ? "danger" : "primary"
                          }
                          className="text-capitalize"
                        >
                          {video.platform}
                        </Badge>
                      </td>
                      <td>
                        {video.roundId
                          ? video.roundId.replace(/round(\d+)/, "Round $1")
                          : "General"}
                      </td>
                      <td className="text-muted small">{video.officer}</td>
                      <td className="text-muted small">
                        {new Date(video.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <Stack direction="horizontal" gap={2}>
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-secondary"
                          >
                            View
                          </a>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(video.id)}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
