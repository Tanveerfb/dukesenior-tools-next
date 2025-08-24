"use client";
import { useEffect, useRef, useState } from "react";
import { Alert, Button, Card, Container, Form, ListGroup } from "react-bootstrap";
import { addToDoTask, fetchTasks, editTaskTitle, deleteTask } from "@/lib/services/todo";
import { useAuth } from "@/hooks/useAuth";
import TaskItem from "@/components/TaskItem";

export default function ToDoListPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [tasks, setTasks] = useState<{ id?: string; text: string }[]>([]);
  const newTaskRef = useRef<HTMLInputElement>(null);

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault(); if (!user) return;
    setLoading(true);
    try {
      const value = newTaskRef.current?.value?.trim();
      if (value) {
        const docRef = await addToDoTask(user, value);
        setTasks(t => [...t, { id: (docRef as any)?.id, text: value }]);
        if (newTaskRef.current) newTaskRef.current.value = "";
      }
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  }

  async function handleEdit(id: string, text: string){
    if(!user) return; await editTaskTitle(user, id, text); setTasks(ts => ts.map(t => t.id === id ? { ...t, text } : t)); }
  async function handleDelete(id: string){ if(!user) return; await deleteTask(user, id); setTasks(ts => ts.filter(t => t.id !== id)); }

  async function getTasks() {
    if (!user) return;
    const list = await fetchTasks(user);
    setTasks(list);
    setReady(true);
  }
  useEffect(() => { getTasks(); }, [user]);

  return (
    <Container className="py-3">
      <Card>
        <Container>
          <Form onSubmit={handleAddTask} className="d-flex gap-2 p-2">
            <Form.Control className="fw-bolder" type="text" placeholder="Type something..." ref={newTaskRef} minLength={5} />
            <Button disabled={loading} type="submit" className="w-25">Add Task</Button>
          </Form>
        </Container>
        <Card.Body>
          {ready ? (
            <ListGroup as="ol">
              {tasks.length > 0 ? tasks.map(t => (
                <TaskItem key={t.id} id={t.id} text={t.text} onEdit={handleEdit} onDelete={handleDelete} />
              )) : <TaskItem text="No tasks here! Try to add one using the bar above..." />}
            </ListGroup>
          ) : <Alert>Nothing here yet.</Alert>}
        </Card.Body>
      </Card>
    </Container>
  );
}

