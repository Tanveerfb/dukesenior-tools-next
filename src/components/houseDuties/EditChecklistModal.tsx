"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  Alert,
  Box,
  Stack,
  IconButton,
  Typography,
  Divider,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  FormControl,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";
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
    <Dialog open={show} onClose={onHide} maxWidth="xl" fullWidth>
      <DialogTitle>
        {checklist ? "Edit" : "Create"} {isTemplate ? "Template" : "Checklist"}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Basic Info */}
        <TextField
          fullWidth
          label="Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="Description (optional)"
          multiline
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Divider sx={{ mb: 3 }} />

        {/* Duties Section */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Duties
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Duty name"
            value={newDutyName}
            onChange={(e) => setNewDutyName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDuty())}
          />
          <Button
            onClick={addDuty}
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ whiteSpace: "nowrap" }}
          >
            Add Duty
          </Button>
        </Stack>

        {duties.length > 0 && (
          <List sx={{ mb: 3 }}>
            {duties.map((duty, index) => (
              <ListItem
                key={duty.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: "background.paper",
                }}
              >
                <Typography>{duty.name}</Typography>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    onClick={() => moveDuty(index, "up")}
                    disabled={index === 0}
                  >
                    <ArrowUpwardIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => moveDuty(index, "down")}
                    disabled={index === duties.length - 1}
                  >
                    <ArrowDownwardIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeDuty(duty.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </ListItem>
            ))}
          </List>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* People Section */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          People
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Person name"
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPerson())}
          />
          <Button
            onClick={addPerson}
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ whiteSpace: "nowrap" }}
          >
            Add Person
          </Button>
        </Stack>

        {people.length > 0 && (
          <List sx={{ mb: 3 }}>
            {people.map((person, index) => (
              <ListItem
                key={person.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: "background.paper",
                }}
              >
                <Typography>{person.name}</Typography>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    onClick={() => movePerson(index, "up")}
                    disabled={index === 0}
                  >
                    <ArrowUpwardIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => movePerson(index, "down")}
                    disabled={index === people.length - 1}
                  >
                    <ArrowDownwardIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removePerson(person.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </ListItem>
            ))}
          </List>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* Assignments Grid */}
        {duties.length > 0 && people.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Weekly Assignments
            </Typography>
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small" sx={{ border: "1px solid", borderColor: "divider" }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Duty</TableCell>
                    {DAYS_OF_WEEK.map((day) => (
                      <TableCell key={day} align="center">
                        {day.substring(0, 3)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {duties.map((duty) => (
                    <TableRow key={duty.id}>
                      <TableCell>{duty.name}</TableCell>
                      {DAYS_OF_WEEK.map((day) => (
                        <TableCell key={day} sx={{ p: 0.5 }}>
                          <FormControl size="small" fullWidth>
                            <Select
                              value={getAssignment(day, duty.id)}
                              onChange={(e) =>
                                handleAssignmentChange(day, duty.id, e.target.value)
                              }
                              displayEmpty
                              aria-label={`Assign person for ${duty.name} on ${day}`}
                            >
                              <MenuItem value="">-</MenuItem>
                              {people.map((person) => (
                                <MenuItem key={person.id} value={person.id}>
                                  {person.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onHide} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
