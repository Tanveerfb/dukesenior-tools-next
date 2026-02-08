"use client";

import { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, ListGroup, Badge, Alert } from "react-bootstrap";
import { useAuth } from "@/hooks/useAuth";
import { createChecklist, updateChecklist } from "@/lib/services/houseDuties";
import {
  Checklist,
  Duty,
  Person,
  DayAssignment,
  DAYS_OF_WEEK,
} from "@/types/houseDuties";
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown } from "react-icons/fa";

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

  const handleAssignmentChange = (day: string, dutyId: string, personId: string) => {
    const existingIndex = assignments.findIndex(
      (a) => a.day === day && a.dutyId === dutyId
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
    const assignment = assignments.find((a) => a.day === day && a.dutyId === dutyId);
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

  return (
    <Modal show={show} onHide={onHide} size="xl" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          {checklist ? "Edit" : "Create"} {isTemplate ? "Template" : "Checklist"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Basic Info */}
        <Form.Group className="mb-3">
          <Form.Label>Name *</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Weekly House Duties"
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Description (optional)</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any notes or instructions..."
          />
        </Form.Group>

        <hr />

        {/* Duties Section */}
        <h5 className="mb-3">Duties</h5>
        <Row className="mb-3">
          <Col>
            <Form.Control
              type="text"
              value={newDutyName}
              onChange={(e) => setNewDutyName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addDuty())}
              placeholder="Enter duty name"
            />
          </Col>
          <Col xs="auto">
            <Button onClick={addDuty} variant="primary">
              <FaPlus /> Add Duty
            </Button>
          </Col>
        </Row>

        {duties.length > 0 && (
          <ListGroup className="mb-4">
            {duties.map((duty, index) => (
              <ListGroup.Item
                key={duty.id}
                className="d-flex justify-content-between align-items-center"
              >
                <span>{duty.name}</span>
                <div className="d-flex gap-2">
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => moveDuty(index, "up")}
                    disabled={index === 0}
                  >
                    <FaArrowUp />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => moveDuty(index, "down")}
                    disabled={index === duties.length - 1}
                  >
                    <FaArrowDown />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => removeDuty(duty.id)}
                  >
                    <FaTrash />
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        <hr />

        {/* People Section */}
        <h5 className="mb-3">People</h5>
        <Row className="mb-3">
          <Col>
            <Form.Control
              type="text"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addPerson())}
              placeholder="Enter person name"
            />
          </Col>
          <Col xs="auto">
            <Button onClick={addPerson} variant="primary">
              <FaPlus /> Add Person
            </Button>
          </Col>
        </Row>

        {people.length > 0 && (
          <ListGroup className="mb-4">
            {people.map((person, index) => (
              <ListGroup.Item
                key={person.id}
                className="d-flex justify-content-between align-items-center"
              >
                <span>{person.name}</span>
                <div className="d-flex gap-2">
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => movePerson(index, "up")}
                    disabled={index === 0}
                  >
                    <FaArrowUp />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => movePerson(index, "down")}
                    disabled={index === people.length - 1}
                  >
                    <FaArrowDown />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => removePerson(person.id)}
                  >
                    <FaTrash />
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        <hr />

        {/* Assignments Grid */}
        {duties.length > 0 && people.length > 0 && (
          <>
            <h5 className="mb-3">Weekly Assignments</h5>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Duty</th>
                    {DAYS_OF_WEEK.map((day) => (
                      <th key={day} className="text-center">
                        {day.substring(0, 3)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {duties.map((duty) => (
                    <tr key={duty.id}>
                      <td>{duty.name}</td>
                      {DAYS_OF_WEEK.map((day) => (
                        <td key={day} className="p-1">
                          <Form.Select
                            size="sm"
                            value={getAssignment(day, duty.id)}
                            onChange={(e) =>
                              handleAssignmentChange(day, duty.id, e.target.value)
                            }
                          >
                            <option value="">-</option>
                            {people.map((person) => (
                              <option key={person.id} value={person.id}>
                                {person.name}
                              </option>
                            ))}
                          </Form.Select>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={saving}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
