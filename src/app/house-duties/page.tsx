"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Card,
  CardContent,
  CardActions,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  FileCopy as FileCopyIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { useAuth } from "@/hooks/useAuth";
import {
  listChecklistsForUser,
  listTemplatesForUser,
  deleteChecklist,
  duplicateChecklist,
} from "@/lib/services/houseDuties";
import { Checklist } from "@/types/houseDuties";
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
  
  // Duplicate modal
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateSource, setDuplicateSource] = useState<Checklist | null>(null);
  const [duplicateAsTemplate, setDuplicateAsTemplate] = useState(false);
  const [duplicateName, setDuplicateName] = useState("");
  const [duplicateError, setDuplicateError] = useState("");

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
    }
  };

  const handleDuplicateClick = (checklist: Checklist, asTemplate: boolean) => {
    setDuplicateSource(checklist);
    setDuplicateAsTemplate(asTemplate);
    setDuplicateName(`${checklist.name} (Copy)`);
    setDuplicateError("");
    setShowDuplicateModal(true);
  };

  const handleDuplicateConfirm = async () => {
    if (!duplicateSource || !user?.uid || !user?.displayName) return;
    
    if (!duplicateName.trim()) {
      setDuplicateError("Please enter a name");
      return;
    }
    
    try {
      await duplicateChecklist(
        duplicateSource.id,
        user.uid,
        user.displayName,
        duplicateName.trim(),
        duplicateAsTemplate
      );
      setShowDuplicateModal(false);
      setDuplicateSource(null);
      setDuplicateName("");
      setDuplicateError("");
      loadData();
    } catch (error) {
      console.error("Error duplicating checklist:", error);
      setDuplicateError("Failed to duplicate checklist. Please try again.");
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
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Alert severity="warning">
          Please log in to use the House Duties Checklist tool.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          House Duties Checklist
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create and manage 7-day checklists for house duties and responsibilities.
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleCreateNew(false)}
        >
          New Checklist
        </Button>
        <Button
          variant="outlined"
          startIcon={<DescriptionIcon />}
          onClick={() => handleCreateNew(true)}
        >
          New Template
        </Button>
      </Stack>

      {/* Filter and Search */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>View</InputLabel>
            <Select
              value={viewMode}
              label="View"
              onChange={(e) => setViewMode(e.target.value as ViewMode)}
            >
              <MenuItem value="all">All Items</MenuItem>
              <MenuItem value="active">Active Checklists</MenuItem>
              <MenuItem value="templates">Templates Only</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Search"
            placeholder="Search by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Grid>
      </Grid>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Checklists List */}
      {!loading && displayedChecklists.length === 0 && (
        <Alert severity="info">
          {searchQuery
            ? "No checklists match your search."
            : "No checklists yet. Create your first one!"}
        </Alert>
      )}

      {!loading && displayedChecklists.length > 0 && (
        <Grid container spacing={3}>
          {displayedChecklists.map((checklist) => (
            <Grid item xs={12} md={6} lg={4} key={checklist.id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1 }}>
                    <Typography variant="h6" component="h2">
                      {checklist.name}
                    </Typography>
                    {checklist.isTemplate && (
                      <Chip label="Template" color="info" size="small" />
                    )}
                  </Box>
                  
                  {checklist.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {checklist.description.length > 100
                        ? checklist.description.substring(0, 100) + "..."
                        : checklist.description}
                    </Typography>
                  )}

                  <Typography variant="caption" color="text.secondary">
                    {checklist.duties.length} duties • {checklist.people.length} people
                  </Typography>

                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 2 }}>
                    Updated: {new Date(checklist.updatedAt).toLocaleDateString()}
                  </Typography>
                </CardContent>

                <CardActions sx={{ flexWrap: "wrap", gap: 1, p: 2, pt: 0 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleView(checklist)}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => handleEdit(checklist)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="info"
                    startIcon={<FileCopyIcon />}
                    onClick={() => handleDuplicateClick(checklist, !checklist.isTemplate)}
                  >
                    Copy
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteClick(checklist)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{checklistToDelete?.name}"? This action
          cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Duplicate Dialog */}
      <Dialog open={showDuplicateModal} onClose={() => setShowDuplicateModal(false)}>
        <DialogTitle>
          Duplicate as {duplicateAsTemplate ? "Template" : "Checklist"}
        </DialogTitle>
        <DialogContent>
          {duplicateError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {duplicateError}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label={`Name for ${duplicateAsTemplate ? "template" : "checklist"}`}
            fullWidth
            value={duplicateName}
            onChange={(e) => setDuplicateName(e.target.value)}
            placeholder="Enter name..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDuplicateModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleDuplicateConfirm} variant="contained">
            Duplicate
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
