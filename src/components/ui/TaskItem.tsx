"use client";
import { useRef, useState } from "react";
import { Button, ButtonGroup, Container, Form, ListGroup } from "react-bootstrap";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
export default function TaskItem({ text, id, onEdit, onDelete }: { text: string; id?: string; onEdit?: (id: string, text: string)=>void|Promise<void>; onDelete?: (id: string)=>void|Promise<void>; }) {
  const newTitle = useRef<HTMLInputElement>(null);
  const [change, setChange] = useState(false);

  async function handleEdit() {
    if (!id) return;
    if (change && newTitle.current?.value) {
      await onEdit?.(id, newTitle.current.value);
    }
    setChange(c => !c);
  }
  async function handleDelete() {
    if (!id) return;
    await onDelete?.(id);
  }
  return (
    <ListGroup.Item as="li">
      <Container className="d-flex align-items-center">
        {change ? (
          <Form.Control type="text" minLength={5} ref={newTitle} defaultValue={text} />
        ) : (
          <Container className="fs-5 text-uppercase gagalin">{text}</Container>
        )}
        {id && (
          <ButtonGroup>
            <Button onClick={handleEdit} variant="warning" className="mx-1"><FaEdit /></Button>
            <Button onClick={handleDelete} variant="danger" className="mx-1"><MdDelete /></Button>
          </ButtonGroup>
        )}
      </Container>
    </ListGroup.Item>
  );
}
