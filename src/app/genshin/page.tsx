"use client";
import Link from 'next/link';
import { Button, ButtonGroup, Container } from 'react-bootstrap';
import CharactersGrid from '@/components/genshin/CharactersGrid';

export default function GenshinPage(){
  return (
    <Container fluid className="py-2">
      <Container fluid className="p-2 bg-body-secondary">
        <ButtonGroup className="d-flex flex-fill flex-wrap">
          {/* Placeholder main wiki button */}
          <Button variant="primary" className="m-1" disabled>
            <span className="text-white text-decoration-none">Genshin Wiki</span>
          </Button>
        </ButtonGroup>
      </Container>
      <CharactersGrid />
    </Container>
  );
}
