"use client";
import { useState, useEffect } from "react";
import {
  Container,
  Button,
  Badge,
  Alert,
  Spinner,
  Card,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";
import { useAuth } from "@/hooks/useAuth";
import InlineLink from "@/components/ui/InlineLink";
import { listPosts, deletePost, setPostPinned } from "@/lib/services/cms";

export default function AdminCMSPage() {
  const { admin } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | undefined>();
  const [actionVariant, setActionVariant] = useState<
    "success" | "danger" | "info"
  >("info");

  async function refresh() {
    setLoading(true);
    try {
      setPosts(await listPosts(200, true)); // Include unpublished for admin
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
  }, []);
  if (!admin)
    return (
      <Container className="py-5">
        <Alert variant="danger">Admin only</Alert>
      </Container>
    );

  return (
    <Container className="py-4">
      <div className="d-flex align-items-center mb-3">
        <h1 className="mb-0 me-auto">CMS Admin</h1>
        <Button as={InlineLink as any} href="/admin/cms/analytics" variant="info" className="me-2">
          Analytics
        </Button>
        <Button as={InlineLink as any} href="/admin/cms/new" variant="success">
          New Post
        </Button>
        <Button
          as={InlineLink as any}
          href="/admin/cms/comments"
          variant="outline-info"
          className="ms-2"
        >
          Comments
        </Button>
      </div>

      {actionMsg && (
        <Alert variant={actionVariant} className="py-2 small mt-2">
          {actionMsg}
        </Alert>
      )}
      <p className="text-muted small">
        Listing latest posts. Click Edit to modify or use New Post.
      </p>
      <h3 className="mb-3">
        Posts{" "}
        {loading && <Spinner size="sm" animation="border" className="ms-2" />}
      </h3>
      {posts.length === 0 && (
        <div className="text-muted small fst-italic">No posts yet.</div>
      )}
      {posts.map((p) => (
        <Card key={p.id} className="mb-3">
          <Card.Header className="d-flex align-items-start justify-content-between">
            <div
              className="fw-semibold text-truncate"
              style={{ maxWidth: 560 }}
            >
              {p.title}
            </div>
            <div className="d-flex gap-2">
              {p.status === 'draft' && (
                <Badge bg="secondary">Draft</Badge>
              )}
              {p.status === 'scheduled' && (
                <Badge bg="primary">Scheduled</Badge>
              )}
              {p.pinned && (
                <Badge bg="warning" text="dark">Pinned</Badge>
              )}
            </div>
          </Card.Header>
          <Card.Body>
            <div style={{ minWidth: 0 }}>
              {(p.tags || []).map((t: string) => (
                <Badge key={t} bg="info" className="me-1">
                  {t}
                </Badge>
              ))}
            </div>

            <div className="mt-3 d-flex align-items-center gap-2">
              <DropdownButton
                id={`actions-${p.id}`}
                title="Actions"
                variant="outline-primary"
                size="sm"
              >
                <Dropdown.Item as="a" href={`/admin/cms/new?id=${p.id}`}>
                  Edit
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    setPostPinned(p.id, !p.pinned).then(refresh);
                  }}
                >
                  {p.pinned ? "Unpin" : "Pin"}
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={async () => {
                    if (!confirm("Delete post?")) return;
                    try {
                      setDeletingId(p.id);
                      await deletePost(p.id);
                      setActionVariant("success");
                      setActionMsg("Post deleted");
                      await refresh();
                    } catch (err: any) {
                      console.error("Delete failed", err);
                      setActionVariant("danger");
                      setActionMsg(
                        "Delete failed: " + (err?.message || "unknown")
                      );
                    } finally {
                      setDeletingId(null);
                      setTimeout(() => setActionMsg(undefined), 4000);
                    }
                  }}
                >
                  {deletingId === p.id ? "Deleting..." : "Delete"}
                </Dropdown.Item>
              </DropdownButton>

              <Badge bg="secondary" className="ms-2">
                {new Date(p.createdAt).toLocaleDateString()}
              </Badge>
              {p.views > 0 && (
                <Badge bg="info" className="ms-2">
                  {p.views} views
                </Badge>
              )}
              {p.status === 'scheduled' && p.scheduledFor && (
                <Badge bg="primary" className="ms-2">
                  Scheduled: {new Date(p.scheduledFor).toLocaleString()}
                </Badge>
              )}
            </div>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}
