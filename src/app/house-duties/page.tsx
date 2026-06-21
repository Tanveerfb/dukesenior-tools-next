"use client";

import { useEffect, useState, useMemo } from "react";
import {
  FiPlus,
  FiTrash2,
  FiEye,
  FiEdit,
  FiCopy,
  FiFileText,
  FiLoader,
} from "react-icons/fi";
import { cn } from "@/lib/utils";
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
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(
    null,
  );
  const [createAsTemplate, setCreateAsTemplate] = useState(false);

  // Confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [checklistToDelete, setChecklistToDelete] = useState<Checklist | null>(
    null,
  );

  // Duplicate modal
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateSource, setDuplicateSource] = useState<Checklist | null>(
    null,
  );
  const [duplicateAsTemplate, setDuplicateAsTemplate] = useState(false);
  const [duplicateName, setDuplicateName] = useState("");
  const [duplicateError, setDuplicateError] = useState("");

  useEffect(() => {
    if (user?.uid) {
      loadData();
    }
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
        duplicateAsTemplate,
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
          (item.description || "").toLowerCase().includes(query),
      );
    }

    return items.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [checklists, templates, viewMode, searchQuery]);

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="rounded-lg border border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-600 p-4 text-yellow-800 dark:text-yellow-200">
          Please log in to use the House Duties Checklist tool.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          House Duties Checklist
        </h1>
        <p className="text-foreground-secondary">
          Create and manage 7-day checklists for house duties and
          responsibilities.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <button
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors",
            "bg-primary-500 text-white hover:bg-primary-600",
          )}
          onClick={() => handleCreateNew(false)}
        >
          <FiPlus className="w-4 h-4" />
          New Checklist
        </button>
        <button
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors",
            "border border-border dark:border-border-dark text-foreground hover:bg-card dark:hover:bg-card-dark",
          )}
          onClick={() => handleCreateNew(true)}
        >
          <FiFileText className="w-4 h-4" />
          New Template
        </button>
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <label
            htmlFor="view-select"
            className="block text-sm font-medium text-foreground-secondary mb-1"
          >
            View
          </label>
          <select
            id="view-select"
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as ViewMode)}
            className={cn(
              "w-full rounded-lg border border-border dark:border-border-dark px-3 py-2 text-sm",
              "bg-background dark:bg-background-dark text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary-500",
            )}
          >
            <option value="all">All Items</option>
            <option value="active">Active Checklists</option>
            <option value="templates">Templates Only</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="search-input"
            className="block text-sm font-medium text-foreground-secondary mb-1"
          >
            Search
          </label>
          <input
            id="search-input"
            type="text"
            placeholder="Search by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full rounded-lg border border-border dark:border-border-dark px-3 py-2 text-sm",
              "bg-background dark:bg-background-dark text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary-500",
              "placeholder:text-foreground-secondary",
            )}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-10">
          <FiLoader className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      )}

      {/* Checklists List */}
      {!loading && displayedChecklists.length === 0 && (
        <div className="rounded-lg border border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600 p-4 text-blue-800 dark:text-blue-200">
          {searchQuery
            ? "No checklists match your search."
            : "No checklists yet. Create your first one!"}
        </div>
      )}

      {!loading && displayedChecklists.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedChecklists.map((checklist) => (
            <div
              key={checklist.id}
              className={cn(
                "flex flex-col rounded-xl border border-border dark:border-border-dark",
                "bg-card dark:bg-card-dark shadow-sm",
              )}
            >
              <div className="flex-1 p-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-semibold text-foreground">
                    {checklist.name}
                  </h2>
                  {checklist.isTemplate && (
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      Template
                    </span>
                  )}
                </div>

                {checklist.description && (
                  <p className="text-sm text-foreground-secondary mb-3">
                    {checklist.description.length > 100
                      ? checklist.description.substring(0, 100) + "..."
                      : checklist.description}
                  </p>
                )}

                <span className="text-xs text-foreground-secondary">
                  {checklist.duties.length} duties • {checklist.people.length}{" "}
                  people
                </span>

                <span className="block text-xs text-foreground-secondary mt-3">
                  Updated: {new Date(checklist.updatedAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 px-4 pb-4">
                <button
                  className={cn(
                    "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    "border border-border dark:border-border-dark text-foreground hover:bg-background dark:hover:bg-background-dark",
                  )}
                  onClick={() => handleView(checklist)}
                >
                  <FiEye className="w-3.5 h-3.5" />
                  View
                </button>
                <button
                  className={cn(
                    "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    "border border-border dark:border-border-dark text-foreground hover:bg-background dark:hover:bg-background-dark",
                  )}
                  onClick={() => handleEdit(checklist)}
                >
                  <FiEdit className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  className={cn(
                    "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    "border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
                  )}
                  onClick={() =>
                    handleDuplicateClick(checklist, !checklist.isTemplate)
                  }
                >
                  <FiCopy className="w-3.5 h-3.5" />
                  Copy
                </button>
                <button
                  className={cn(
                    "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    "border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
                  )}
                  onClick={() => handleDeleteClick(checklist)}
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
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
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className={cn(
              "w-full max-w-md rounded-xl p-6",
              "bg-card dark:bg-card-dark border border-border dark:border-border-dark shadow-lg",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Confirm Delete
            </h2>
            <p className="text-sm text-foreground-secondary mb-6">
              Are you sure you want to delete &quot;{checklistToDelete?.name}
              &quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  "border border-border dark:border-border-dark text-foreground hover:bg-background dark:hover:bg-background-dark",
                )}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  "bg-red-600 text-white hover:bg-red-700",
                )}
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Dialog */}
      {showDuplicateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowDuplicateModal(false)}
        >
          <div
            className={cn(
              "w-full max-w-md rounded-xl p-6",
              "bg-card dark:bg-card-dark border border-border dark:border-border-dark shadow-lg",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Duplicate as {duplicateAsTemplate ? "Template" : "Checklist"}
            </h2>
            <div className="space-y-3">
              {duplicateError && (
                <div className="rounded-lg border border-red-400 bg-red-50 dark:bg-red-900/20 dark:border-red-600 p-3 text-sm text-red-800 dark:text-red-200">
                  {duplicateError}
                </div>
              )}
              <div>
                <label
                  htmlFor="duplicate-name"
                  className="block text-sm font-medium text-foreground-secondary mb-1"
                >
                  Name for {duplicateAsTemplate ? "template" : "checklist"}
                </label>
                <input
                  id="duplicate-name"
                  type="text"
                  autoFocus
                  placeholder="Enter name..."
                  value={duplicateName}
                  onChange={(e) => setDuplicateName(e.target.value)}
                  className={cn(
                    "w-full rounded-lg border border-border dark:border-border-dark px-3 py-2 text-sm",
                    "bg-background dark:bg-background-dark text-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500",
                    "placeholder:text-foreground-secondary",
                  )}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  "border border-border dark:border-border-dark text-foreground hover:bg-background dark:hover:bg-background-dark",
                )}
                onClick={() => setShowDuplicateModal(false)}
              >
                Cancel
              </button>
              <button
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  "bg-primary-500 text-white hover:bg-primary-600",
                )}
                onClick={handleDuplicateConfirm}
              >
                Duplicate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
