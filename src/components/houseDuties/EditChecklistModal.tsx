"use client";

import { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiArrowUp, FiArrowDown } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { createChecklist, updateChecklist } from "@/lib/services/houseDuties";
import {
  Checklist,
  Duty,
  Person,
  DayAssignment,
  DAYS_OF_WEEK,
} from "@/types/houseDuties";

interface Props {
  show: boolean;
  onHide: () => void;
  checklist: Checklist | null;
  isTemplate: boolean;
  onSaveSuccess: () => void;
}

export default function EditChecklistModal({
  show,
  onHide,
  checklist,
  isTemplate,
  onSaveSuccess,
}: Props) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duties, setDuties] = useState<Duty[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [assignments, setAssignments] = useState<DayAssignment[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // New item inputs
  const [newDutyName, setNewDutyName] = useState("");
  const [newPersonName, setNewPersonName] = useState("");

  useEffect(() => {
    if (checklist) {
      setName(checklist.name);
      setDescription(checklist.description || "");
      setDuties([...checklist.duties]);
      setPeople([...checklist.people]);
      setAssignments([...checklist.assignments]);
    } else {
      resetForm();
    }
  }, [checklist]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setDuties([]);
    setPeople([]);
    setAssignments([]);
    setNewDutyName("");
    setNewPersonName("");
    setError("");
  };

  const addDuty = () => {
    if (!newDutyName.trim()) return;
    const newDuty: Duty = {
      id: crypto.randomUUID(),
      name: newDutyName.trim(),
      order: duties.length,
    };
    setDuties([...duties, newDuty]);
    setNewDutyName("");
  };

  const removeDuty = (id: string) => {
    setDuties(duties.filter((d) => d.id !== id));
    // Remove assignments for this duty
    setAssignments(assignments.filter((a) => a.dutyId !== id));
  };

  const moveDuty = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === duties.length - 1)
    ) {
      return;
    }

    const newDuties = [...duties];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newDuties[index], newDuties[targetIndex]] = [
      newDuties[targetIndex],
      newDuties[index],
    ];
    // Update order
    newDuties.forEach((d, i) => (d.order = i));
    setDuties(newDuties);
  };

  const addPerson = () => {
    if (!newPersonName.trim()) return;
    const newPerson: Person = {
      id: crypto.randomUUID(),
      name: newPersonName.trim(),
      order: people.length,
    };
    setPeople([...people, newPerson]);
    setNewPersonName("");
  };

  const removePerson = (id: string) => {
    setPeople(people.filter((p) => p.id !== id));
    // Remove assignments for this person
    setAssignments(assignments.filter((a) => a.personId !== id));
  };

  const movePerson = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === people.length - 1)
    ) {
      return;
    }

    const newPeople = [...people];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newPeople[index], newPeople[targetIndex]] = [
      newPeople[targetIndex],
      newPeople[index],
    ];
    // Update order
    newPeople.forEach((p, i) => (p.order = i));
    setPeople(newPeople);
  };

  const handleAssignmentChange = (
    day: string,
    dutyId: string,
    personId: string,
  ) => {
    const existingIndex = assignments.findIndex(
      (a) => a.day === day && a.dutyId === dutyId,
    );

    if (existingIndex >= 0) {
      // Update existing
      const newAssignments = [...assignments];
      newAssignments[existingIndex] = { day, dutyId, personId };
      setAssignments(newAssignments);
    } else {
      // Add new
      setAssignments([...assignments, { day, dutyId, personId }]);
    }
  };

  const getAssignment = (day: string, dutyId: string): string => {
    const assignment = assignments.find(
      (a) => a.day === day && a.dutyId === dutyId,
    );
    return assignment?.personId || "";
  };

  const handleSave = async () => {
    setError("");

    // Validation
    if (!name.trim()) {
      setError("Please enter a name for the checklist");
      return;
    }

    if (duties.length === 0) {
      setError("Please add at least one duty");
      return;
    }

    if (people.length === 0) {
      setError("Please add at least one person");
      return;
    }

    if (!user?.uid || !user?.displayName) {
      setError("You must be logged in to save");
      return;
    }

    setSaving(true);
    try {
      if (checklist) {
        // Update existing
        await updateChecklist({
          id: checklist.id,
          name: name.trim(),
          description: description.trim(),
          duties,
          people,
          assignments,
          isTemplate,
        });
      } else {
        // Create new
        await createChecklist(user.uid, user.displayName, {
          name: name.trim(),
          description: description.trim(),
          duties,
          people,
          assignments,
          isTemplate,
        });
      }
      onSaveSuccess();
    } catch (err) {
      console.error("Error saving checklist:", err);
      setError("Failed to save checklist. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onHide}
    >
      <div
        className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-card dark:bg-card-dark rounded-2xl shadow-xl border border-border dark:border-border-dark animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dialog Title */}
        <div className="px-6 py-4 border-b border-border dark:border-border-dark">
          <h2 className="text-xl font-semibold text-foreground dark:text-foreground-dark">
            {checklist ? "Edit" : "Create"}{" "}
            {isTemplate ? "Template" : "Checklist"}
          </h2>
        </div>

        {/* Dialog Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground dark:text-foreground-dark mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark px-3 py-2 text-sm text-foreground dark:text-foreground-dark placeholder:text-foreground-muted dark:placeholder:text-foreground-dark-muted focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="Checklist name"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground dark:text-foreground-dark mb-1">
              Description (optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark px-3 py-2 text-sm text-foreground dark:text-foreground-dark placeholder:text-foreground-muted dark:placeholder:text-foreground-dark-muted focus:outline-none focus:ring-2 focus:ring-primary-400 resize-vertical"
              placeholder="Optional description"
            />
          </div>

          <hr className="mb-6 border-border dark:border-border-dark" />

          {/* Duties Section */}
          <h3 className="text-lg font-semibold text-foreground dark:text-foreground-dark mb-3">
            Duties
          </h3>
          <div className="flex gap-3 mb-3">
            <input
              type="text"
              value={newDutyName}
              onChange={(e) => setNewDutyName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addDuty();
                }
              }}
              className="flex-1 rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark px-3 py-2 text-sm text-foreground dark:text-foreground-dark placeholder:text-foreground-muted dark:placeholder:text-foreground-dark-muted focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="Duty name"
            />
            <button
              type="button"
              onClick={addDuty}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
            >
              <FiPlus size={16} />
              Add Duty
            </button>
          </div>

          {duties.length > 0 && (
            <div className="mb-6 space-y-2">
              {duties.map((duty, index) => (
                <div
                  key={duty.id}
                  className="flex items-center justify-between rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark px-4 py-2.5"
                >
                  <span className="text-sm text-foreground dark:text-foreground-dark">
                    {duty.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveDuty(index, "up")}
                      disabled={index === 0}
                      className={cn(
                        "rounded p-1.5 transition-colors",
                        index === 0
                          ? "text-foreground-muted/40 dark:text-foreground-dark-muted/40 cursor-not-allowed"
                          : "text-foreground-muted dark:text-foreground-dark-muted hover:bg-surface-200 dark:hover:bg-surface-900",
                      )}
                    >
                      <FiArrowUp size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDuty(index, "down")}
                      disabled={index === duties.length - 1}
                      className={cn(
                        "rounded p-1.5 transition-colors",
                        index === duties.length - 1
                          ? "text-foreground-muted/40 dark:text-foreground-dark-muted/40 cursor-not-allowed"
                          : "text-foreground-muted dark:text-foreground-dark-muted hover:bg-surface-200 dark:hover:bg-surface-900",
                      )}
                    >
                      <FiArrowDown size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeDuty(duty.id)}
                      className="rounded p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <hr className="mb-6 border-border dark:border-border-dark" />

          {/* People Section */}
          <h3 className="text-lg font-semibold text-foreground dark:text-foreground-dark mb-3">
            People
          </h3>
          <div className="flex gap-3 mb-3">
            <input
              type="text"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addPerson();
                }
              }}
              className="flex-1 rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark px-3 py-2 text-sm text-foreground dark:text-foreground-dark placeholder:text-foreground-muted dark:placeholder:text-foreground-dark-muted focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="Person name"
            />
            <button
              type="button"
              onClick={addPerson}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
            >
              <FiPlus size={16} />
              Add Person
            </button>
          </div>

          {people.length > 0 && (
            <div className="mb-6 space-y-2">
              {people.map((person, index) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark px-4 py-2.5"
                >
                  <span className="text-sm text-foreground dark:text-foreground-dark">
                    {person.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => movePerson(index, "up")}
                      disabled={index === 0}
                      className={cn(
                        "rounded p-1.5 transition-colors",
                        index === 0
                          ? "text-foreground-muted/40 dark:text-foreground-dark-muted/40 cursor-not-allowed"
                          : "text-foreground-muted dark:text-foreground-dark-muted hover:bg-surface-200 dark:hover:bg-surface-900",
                      )}
                    >
                      <FiArrowUp size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => movePerson(index, "down")}
                      disabled={index === people.length - 1}
                      className={cn(
                        "rounded p-1.5 transition-colors",
                        index === people.length - 1
                          ? "text-foreground-muted/40 dark:text-foreground-dark-muted/40 cursor-not-allowed"
                          : "text-foreground-muted dark:text-foreground-dark-muted hover:bg-surface-200 dark:hover:bg-surface-900",
                      )}
                    >
                      <FiArrowDown size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removePerson(person.id)}
                      className="rounded p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <hr className="mb-6 border-border dark:border-border-dark" />

          {/* Assignments Grid */}
          {duties.length > 0 && people.length > 0 && (
            <>
              <h3 className="text-lg font-semibold text-foreground dark:text-foreground-dark mb-3">
                Weekly Assignments
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-border dark:border-border-dark">
                  <thead>
                    <tr className="bg-surface-100 dark:bg-surface-900">
                      <th className="text-left px-3 py-2 font-medium text-foreground dark:text-foreground-dark border-b border-border dark:border-border-dark">
                        Duty
                      </th>
                      {DAYS_OF_WEEK.map((day) => (
                        <th
                          key={day}
                          className="text-center px-2 py-2 font-medium text-foreground dark:text-foreground-dark border-b border-border dark:border-border-dark"
                        >
                          {day.substring(0, 3)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {duties.map((duty) => (
                      <tr
                        key={duty.id}
                        className="border-b border-border/50 dark:border-border-dark/50 last:border-0"
                      >
                        <td className="px-3 py-1.5 text-foreground dark:text-foreground-dark whitespace-nowrap">
                          {duty.name}
                        </td>
                        {DAYS_OF_WEEK.map((day) => (
                          <td key={day} className="px-1 py-1">
                            <select
                              value={getAssignment(day, duty.id)}
                              onChange={(e) =>
                                handleAssignmentChange(
                                  day,
                                  duty.id,
                                  e.target.value,
                                )
                              }
                              aria-label={`Assign person for ${duty.name} on ${day}`}
                              className="w-full rounded border border-border dark:border-border-dark bg-card dark:bg-card-dark px-1.5 py-1 text-xs text-foreground dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary-400"
                            >
                              <option value="">-</option>
                              {people.map((person) => (
                                <option key={person.id} value={person.id}>
                                  {person.name}
                                </option>
                              ))}
                            </select>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Dialog Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border dark:border-border-dark">
          <button
            type="button"
            onClick={onHide}
            disabled={saving}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              saving
                ? "text-foreground-muted/50 dark:text-foreground-dark-muted/50 cursor-not-allowed"
                : "text-foreground dark:text-foreground-dark hover:bg-surface-200 dark:hover:bg-surface-900",
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors",
              saving
                ? "bg-primary-400 cursor-not-allowed opacity-60"
                : "bg-primary-500 hover:bg-primary-600",
            )}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
