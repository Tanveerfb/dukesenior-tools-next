"use client";
import { useRef, useState } from "react";
import { Button, ButtonGroup, Container, Form, ListGroup } from "react-bootstrap";
import { NAMED_COLORS, isValidHex } from '@/lib/utils/color';
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
export default function TaskItem({ text, id, onEdit, onDelete, color }: { text: string; id?: string; color?: string; onEdit?: (id: string, text: string, color?: string)=>void|Promise<void>; onDelete?: (id: string)=>void|Promise<void>; }) {
  const newTitle = useRef<HTMLInputElement>(null);
  const colorRef = useRef<HTMLInputElement>(null);
  const [change, setChange] = useState(false);

  async function handleEdit() {
    if (!id) return;
    if (change && newTitle.current?.value) {
      const c = colorRef.current?.value;
      await onEdit?.(id, newTitle.current.value, c);
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
          <div style={{width:'100%'}}>
            <Form.Control type="text" minLength={5} ref={newTitle} defaultValue={text} />
            <div className="mt-2 d-flex align-items-center gap-2">
              <Form.Control type="color" defaultValue={isValidHex(color) ? color : '#ffffff'} ref={colorRef} style={{width:48, height:32, padding:0}} />
              <div className="d-flex gap-1">
                {NAMED_COLORS.slice(1).map(c => (
                  <Button key={c.value} title={c.name} size="sm" variant="light" style={{background: c.value, border: '1px solid rgba(0,0,0,0.08)'}} onClick={()=>{ if(colorRef.current) colorRef.current.value = c.value; }} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Container className="fs-5 text-uppercase gagalin d-flex align-items-center">
            <div style={{width:12, height:12, background: isValidHex(color) ? color : 'transparent', borderRadius:3, marginRight:8, border: color? '':'1px dashed #ddd'}} />
            <div>{text}</div>
          </Container>
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
