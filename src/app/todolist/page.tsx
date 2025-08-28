"use client";
import { useEffect, useRef, useState } from "react";
import { Alert, Button, Card, Container, Form, ListGroup, Modal, Toast, ToastContainer } from "react-bootstrap";
import { addToDoTask, fetchTasks, editTaskTitle, deleteTask } from "@/lib/services/todo";
import { NAMED_COLORS, isValidHex } from '@/lib/utils/color';
import { useAuth } from "@/hooks/useAuth";
import TaskItem from "@/components/TaskItem";

export default function ToDoListPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [tasks, setTasks] = useState<{ id?: string; text: string }[]>([]);
  const newTaskRef = useRef<HTMLInputElement>(null);
  const newColorRef = useRef<HTMLInputElement>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; text: string } | null>(null);
  const [showUndo, setShowUndo] = useState(false);

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault(); if (!user) return;
    setLoading(true);
    try {
      const value = newTaskRef.current?.value?.trim();
      const color = newColorRef.current?.value || undefined;
      // validate color
      const colorToUse = isValidHex(color) ? color : undefined;
      if (value) {
        const docRef = await addToDoTask(user, value, colorToUse);
        setTasks(t => [...t, { id: (docRef as any)?.id, text: value, color: colorToUse }]);
        if (newTaskRef.current) newTaskRef.current.value = "";
        if (newColorRef.current) newColorRef.current.value = '#ffffff';
      }
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  }

  async function handleEdit(id: string, text: string, color?: string){
    if(!user) return; await editTaskTitle(user, id, text, color); setTasks(ts => ts.map(t => t.id === id ? { ...t, text, color } : t)); }
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
          <Form onSubmit={handleAddTask} className="d-flex gap-2 p-2 align-items-center">
            <Form.Control className="fw-bolder" type="text" placeholder="Type something..." ref={newTaskRef} minLength={5} />
            <Form.Control type="color" defaultValue="#ffffff" ref={newColorRef} style={{width:48, height:36, padding:0}} />
            <div className="d-none d-md-flex gap-1">
              {NAMED_COLORS.slice(1).map(c => (
                <Button key={c.value} size="sm" variant="light" style={{background:c.value, border:'1px solid rgba(0,0,0,0.06)'}} onClick={()=>{ if(newColorRef.current) newColorRef.current.value = c.value; }} />
              ))}
            </div>
            <Button disabled={loading} type="submit" className="w-25">Add Task</Button>
          </Form>
        </Container>
        <Card.Body>
          {ready ? (
            <ListGroup as="ol">
              {tasks.length > 0 ? tasks.map(t => (
                <TaskItem key={t.id} id={t.id} text={t.text} color={(t as any).color} onEdit={handleEdit} onDelete={(id)=> setConfirmDeleteId(id || null)} />
              )) : <TaskItem text="No tasks here! Try to add one using the bar above..." />}
            </ListGroup>
          ) : <Alert>Nothing here yet.</Alert>}
        </Card.Body>
      </Card>

      <Modal show={!!confirmDeleteId} onHide={()=> setConfirmDeleteId(null)}>
        <Modal.Header closeButton><Modal.Title>Confirm delete</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete this task? This action can be undone briefly.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={()=> setConfirmDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={async ()=>{
            if(!confirmDeleteId || !user) return setConfirmDeleteId(null);
            // optimistic remove
            const toDelete = tasks.find(t => t.id === confirmDeleteId);
            setPendingDelete(toDelete ? { id: toDelete.id!, text: toDelete.text } : null);
            setTasks(ts => ts.filter(t => t.id !== confirmDeleteId));
            setConfirmDeleteId(null);
            setShowUndo(true);
            // perform actual delete
            try{ await deleteTask(user, confirmDeleteId); }catch(err){ console.error(err); }
            // automatically hide undo after 6s
            setTimeout(()=> setShowUndo(false), 6000);
          }}>Delete</Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="bottom-end" className="p-3">
        <Toast onClose={()=>{ setShowUndo(false); setPendingDelete(null); }} show={showUndo} delay={6000} autohide>
          <Toast.Header>
            <strong className="me-auto">Task deleted</strong>
          </Toast.Header>
          <Toast.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div className="small">{pendingDelete?.text}</div>
              <div>
                <Button size="sm" variant="outline-primary" onClick={async ()=>{
                  // undo: re-add task (best-effort)
                  if(!pendingDelete || !user) return;
                  try{
                    const docRef = await addToDoTask(user, pendingDelete.text);
                    setTasks(ts => [...ts, { id: (docRef as any)?.id, text: pendingDelete.text }]);
                  }catch(e){ console.error(e); }
                  setPendingDelete(null); setShowUndo(false);
                }}>Undo</Button>
              </div>
            </div>
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}

// NOTE: mini component extracted to src/components/home/ToDoMini.tsx to avoid exporting named symbols from a Next page file.

