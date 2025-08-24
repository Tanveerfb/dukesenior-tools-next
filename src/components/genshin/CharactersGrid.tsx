"use client";
import { useEffect, useState } from 'react';
import { Card, Container } from 'react-bootstrap';
import { getCharacterList } from '@/lib/services/genshin';
import Link from 'next/link';

interface Character { name:string; vision:string; region:string; weaponType:string; icon:string; description?:string; }

export default function CharactersGrid(){
  const [list,setList] = useState<Character[]>([]);
  useEffect(()=>{(async()=>{ setList(await getCharacterList()); })();},[]);
  return (
    <Container fluid className="bg-dark-subtle">
      <Container fluid="lg" className="p-0 d-flex flex-wrap flex-row justify-content-center">
        {list.map(c => (
          <Card key={c.name} style={{width:"10rem"}} className="p-1 m-1" border={c.vision?.toLowerCase() as any}>
            <Link href={`/genshin/character/${encodeURIComponent(c.name)}`} className="text-decoration-none text-body">
              {c.icon && <Card.Img variant="top" src={c.icon} alt={`${c.name} icon`} />}
              <Card.Body>
                <Card.Title>{c.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-dark-emphasis">{c.region}</Card.Subtitle>
                <Card.Text>
                  <strong>Vision:</strong> {c.vision}<br/>
                  <strong>Weapon:</strong> {c.weaponType}<br/>
                </Card.Text>
              </Card.Body>
            </Link>
          </Card>
        ))}
      </Container>
    </Container>
  );
}
