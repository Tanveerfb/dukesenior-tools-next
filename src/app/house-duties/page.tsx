"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Spinner,
  Badge,
  Modal,
  Alert,
} from "react-bootstrap";
import { useAuth } from "@/hooks/useAuth";
import {
  listChecklistsForUser,
  listTemplatesForUser,
  deleteChecklist,
  duplicateChecklist,
} from "@/lib/services/houseDuties";
import { Checklist } from "@/types/houseDuties";
import { FaPlus, FaTrash, FaEye, FaEdit, FaCopy, FaFileAlt } from "react-icons/fa";
import EditChecklistModal from "@/components/houseDuties/EditChecklistModal";
import ViewChecklistModal from "@/components/houseDuties/ViewChecklistModal";

type ViewMode = "all" | "active" | "templates";

export default function HouseDutiesPage() {
  const { user } = useAuth();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [templates, setTemplates] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [createAsTemplate, setCreateAsTemplate] = useState(false);

  // Confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [checklistToDelete, setChecklistToDelete] = useState<Checklist | null>(null);

  useEffect(() => {
    if (user?.uid) {
      loadData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const loadData = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const [allChecklists, allTemplates] = await Promise.all([
        listChecklistsForUser(user.uid),
        listTemplatesForUser(user.uid),
      ]);
      setChecklists(allChecklists);
      setTemplates(allTemplates);
    } catch (error) {
      console.error("Error loading checklists:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = (asTemplate: boolean) => {
    setSelectedChecklist(null);
    setCreateAsTemplate(asTemplate);
    setShowEditModal(true);
  };

  const handleEdit = (checklist: Checklist) => {
    setSelectedChecklist(checklist);
    setShowEditModal(true);
  };

  const handleView = (checklist: Checklist) => {
    setSelectedChecklist(checklist);
    setShowViewModal(true);
  };

  const handleDeleteClick = (checklist: Checklist) => {
    setChecklistToDelete(checklist);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!checklistToDelete) return;
    try {
      await deleteChecklist(checklistToDelete.id);
      setShowDeleteConfirm(false);
      setChecklistToDelete(null);
      loadData();
    } catch (error) {
      console.error("Error deleting checklist:", error);
      alert("Failed to delete checklist");
    }
  };

  const handleDuplicate = async (checklist: Checklist, asTemplate: boolean) => {
    if (!user?.uid || !user?.displayName) return;
    try {
      const newName = prompt(
        `Enter name for ${asTemplate ? "template" : "checklist"}:`,
        `${checklist.name} (Copy)`
      );
      if (!newName) return;
      
      await duplicateChecklist(
        checklist.id,
        user.uid,
        user.displayName,
        newName,
        asTemplate
      );
      loadData();
    } catch (error) {
      console.error("Error duplicating checklist:", error);
      alert("Failed to duplicate checklist");
    }
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setShowViewModal(false);
    setSelectedChecklist(null);
    setCreateAsTemplate(false);
  };

  const handleSaveSuccess = () => {
    handleModalClose();
    loadData();
  };

  // Filter checklists based on view mode and search
  const displayedChecklists = useMemo(() => {
    let items: Checklist[] = [];
    
    if (viewMode === "all") {
      items = [...checklists, ...templates];
    } else if (viewMode === "active") {
      items = checklists.filter((c) => !c.isTemplate);
    } else if (viewMode === "templates") {
      items = templates;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          (item.description || "").toLowerCase().includes(query)
      );
    }

    return items.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [checklists, templates, viewMode, searchQuery]);

  if (!user) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Please log in to use the House Duties Checklist tool.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h1 className="mb-2">House Duties Checklist</h1>
          <p className="text-muted">
            Create and manage 7-day checklists for house duties and responsibilities.
          </p>
        </Col>
      </Row>

      {/* Action Buttons */}
      <Row className="mb-4">
        <Col xs={12} md="auto" className="mb-2">
          <Button
            variant="primary"
            onClick={() => handleCreateNew(false)}
            className="w-100 w-md-auto"
          >
            <FaPlus className="me-2" />
            New Checklist
          </Button>
        </Col>
        <Col xs={12} md="auto" className="mb-2">
          <Button
            variant="outline-primary"
            onClick={() => handleCreateNew(true)}
            className="w-100 w-md-auto"
          >
            <FaFileAlt className="me-2" />
            New Template
          </Button>
        </Col>
      </Row>

      {/* Filter and Search */}
      <Row className="mb-4">
        <Col xs={12} md={6} className="mb-3 mb-md-0">
          <Form.Group>
            <Form.Label>View</Form.Label>
            <Form.Select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as ViewMode)}
            >
              <option value="all">All Items</option>
              <option value="active">Active Checklists</option>
              <option value="templates">Templates Only</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col xs={12} md={6}>
          <Form.Group>
            <Form.Label>Search</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-3 text-muted">Loading...</p>
        </div>
      )}

      {/* Checklists List */}
      {!loading && displayedChecklists.length === 0 && (
        <Alert variant="info">
          {searchQuery
            ? "No checklists match your search."
            : "No checklists yet. Create your first one!"}
        </Alert>
      )}

      {!loading && displayedChecklists.length > 0 && (
        <Row>
          {displayedChecklists.map((checklist) => (
            <Col key={checklist.id} xs={12} md={6} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="mb-0">{checklist.name}</Card.Title>
                    {checklist.isTemplate && (
                      <Badge bg="info" className="ms-2">
                        Template
                      </Badge>
                    )}
                  </div>
                  
                  {checklist.description && (
                    <Card.Text className="text-muted small">
                      {checklist.description.length > 100
                        ? checklist.description.substring(0, 100) + "..."
                        : checklist.description}
                    </Card.Text>
                  )}

                  <div className="mb-3">
                    <small className="text-muted">
                      {checklist.duties.length} duties • {checklist.people.length} people
                    </small>
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => handleView(checklist)}
                    >
                      <FaEye className="me-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => handleEdit(checklist)}
                    >
                      <FaEdit className="me-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-info"
                      onClick={() =>
                        handleDuplicate(checklist, !checklist.isTemplate)
                      }
                    >
                      <FaCopy className="me-1" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDeleteClick(checklist)}
                    >
                      <FaTrash className="me-1" />
                      Delete
                    </Button>
                  </div>

                  <div className="mt-3">
                    <small className="text-muted">
                      Updated: {new Date(checklist.updatedAt).toLocaleDateString()}
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Edit/Create Modal */}
      {showEditModal && (
        <EditChecklistModal
          show={showEditModal}
          onHide={handleModalClose}
          checklist={selectedChecklist}
          isTemplate={createAsTemplate}
          onSaveSuccess={handleSaveSuccess}
        />
      )}

      {/* View Modal */}
      {showViewModal && selectedChecklist && (
        <ViewChecklistModal
          show={showViewModal}
          onHide={handleModalClose}
          checklist={selectedChecklist}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{checklistToDelete?.name}"? This action
          cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
