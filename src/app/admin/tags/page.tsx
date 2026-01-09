"use client";
import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  ButtonGroup,
  Container,
  Form,
  Modal,
  Table,
} from "react-bootstrap";
import type { EffectiveMeta } from "@/types/tags";
import { useAuth } from "@/hooks/useAuth";

// Use shared EffectiveMeta type from src/types/tags

export default function AdminTagsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<EffectiveMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editPath, setEditPath] = useState<string | null>(null);
  const [editTags, setEditTags] = useState("");
  const [editMode, setEditMode] = useState<"merge" | "replace">("merge");
  const [show, setShow] = useState(false);
  const [registry, setRegistry] = useState<{ name: string; data: any }[]>([]);
  const [regName, setRegName] = useState("");
  const [regDesc, setRegDesc] = useState("");
  const [regColor, setRegColor] = useState("");

  async function authHeader() {
    if (!user) return {} as any;
    try {
      const token = await (user as any).getIdToken();
      return { Authorization: `Bearer ${token}` };
    } catch {
      return {};
    }
  }

  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      // Batch fetch all effective metas
      const eff = await fetch("/api/tags/effective");
      if (!eff.ok) throw new Error(await eff.text());
      const metas: EffectiveMeta[] = await eff.json();
      setRows(metas.sort((a, b) => (a.path || "").localeCompare(b.path || "")));
      const reg = await fetch("/api/tags/registry");
      if (reg.ok) setRegistry(await reg.json());
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }
  useEffect(() => {
    fetchAll();
  }, []);

  function openEdit(r: EffectiveMeta) {
    setEditPath(r.path);
    setEditMode(r.override?.mode || "merge");
    setEditTags(r.override?.tags?.join(", ") || r.staticTags?.join(", ") || "");
    setShow(true);
  }

  async function handleSave() {
    if (!editPath) return;
    const tags = editTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const headers: any = {
      "Content-Type": "application/json",
      ...(await authHeader()),
    };
    const res = await fetch("/api/tags/route", {
      method: "PUT",
      headers,
      body: JSON.stringify({ path: editPath, tags, mode: editMode }),
    });
    if (res.ok) {
      setShow(false);
      fetchAll();
    }
  }
  async function handleDeleteOverride(path: string) {
    const headers: any = await authHeader();
    await fetch(`/api/tags/route?path=${encodeURIComponent(path)}`, {
      method: "DELETE",
      headers,
    });
    fetchAll();
  }
  async function handleRegistryUpsert() {
    if (!regName) return;
    const headers: any = {
      "Content-Type": "application/json",
      ...(await authHeader()),
    };
    await fetch("/api/tags/registry", {
      method: "PUT",
      headers,
      body: JSON.stringify({
        name: regName,
        description: regDesc,
        color: regColor,
      }),
    });
    setRegName("");
    setRegDesc("");
    setRegColor("");
    fetchAll();
  }
  async function handleRegistryDelete(name: string) {
    const headers: any = await authHeader();
    await fetch(`/api/tags/registry?name=${encodeURIComponent(name)}`, {
      method: "DELETE",
      headers,
    });
    fetchAll();
  }

  return (
    <Container className="py-3">
      <h2>Tag Management</h2>
      <p className="text-muted small">
        Early admin interface. Future: dynamic route discovery, registry,
        validation.
      </p>
      {error && <Alert variant="danger">{error}</Alert>}
      <Button size="sm" onClick={fetchAll} disabled={loading}>
        {loading ? "Refreshing..." : "Refresh"}
      </Button>
      <Table striped hover size="sm" responsive className="mt-3">
        <thead>
          <tr>
            <th>Path</th>
            <th>Static Tags</th>
            <th>Override Tags</th>
            <th>Mode</th>
            <th>Effective</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.path}>
              <td>{r.path}</td>
              <td>
                {r.staticTags?.map((t) => (
                  <Badge key={t} bg="secondary" className="me-1">
                    {t}
                  </Badge>
                ))}
              </td>
              <td>
                {r.override?.tags?.map((t: string) => (
                  <Badge key={t} bg="warning" className="me-1 text-dark">
                    {t}
                  </Badge>
                ))}
              </td>
              <td>{r.override?.mode || "merge"}</td>
              <td>
                {r.effective.map((t) => (
                  <Badge key={t} bg="dark" className="me-1">
                    {t}
                  </Badge>
                ))}
              </td>
              <td>
                <ButtonGroup size="sm">
                  <Button variant="primary" onClick={() => openEdit(r)}>
                    Edit
                  </Button>
                  {r.override && (
                    <Button
                      variant="outline-danger"
                      onClick={() => handleDeleteOverride(r.path)}
                    >
                      Del Override
                    </Button>
                  )}
                </ButtonGroup>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h4 className="mt-4">Tag Registry</h4>
      <Table striped hover size="sm" responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Color</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {registry.map((r) => (
            <tr key={r.name}>
              <td>
                <Badge style={{ background: r.data.color || "#666" }}>
                  {r.name}
                </Badge>
              </td>
              <td>{r.data.description || ""}</td>
              <td>{r.data.color || ""}</td>
              <td>
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => handleRegistryDelete(r.name)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
          <tr>
            <td>
              <Form.Control
                size="sm"
                placeholder="Name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
              />
            </td>
            <td>
              <Form.Control
                size="sm"
                placeholder="Description"
                value={regDesc}
                onChange={(e) => setRegDesc(e.target.value)}
              />
            </td>
            <td>
              <Form.Control
                size="sm"
                placeholder="#color"
                value={regColor}
                onChange={(e) => setRegColor(e.target.value)}
              />
            </td>
            <td>
              <Button
                size="sm"
                variant="primary"
                onClick={handleRegistryUpsert}
              >
                Save
              </Button>
            </td>
          </tr>
        </tbody>
      </Table>

      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Tags</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Path</Form.Label>
            <Form.Control value={editPath || ""} disabled />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Tags (comma separated)</Form.Label>
            <Form.Control
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              placeholder="PhasmoTourney4, Bracket"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mode</Form.Label>
            <Form.Select
              value={editMode}
              onChange={(e) => setEditMode(e.target.value as any)}
            >
              <option value="merge">Merge (static + override)</option>
              <option value="replace">Replace (override only)</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
