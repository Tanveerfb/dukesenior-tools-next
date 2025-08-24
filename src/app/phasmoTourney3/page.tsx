"use client";
import { Container } from 'react-bootstrap';
import Round1 from '@/components/tourney3/Round1';
import Round2 from '@/components/tourney3/Round2';
import Round3 from '@/components/tourney3/Round3';
import Round4 from '@/components/tourney3/Round4';

export default function PhasmoTourney3Page(){
  return (
    <Container fluid="lg" className="d-flex flex-column p-2">
      <Round1 />
      <Round2 />
      <Round3 />
      <Round4 />
    </Container>
  );
}
