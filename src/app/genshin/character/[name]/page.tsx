"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Alert, Button, Card, Container } from 'react-bootstrap';
import { getCharacter } from '@/lib/services/genshin';

interface Character { name:string; region:string; vision:string; weaponType:string; icon:string; description?:string; talent?:string; talentLocation?:string; }

export default function CharacterPage(){
  const { name } = useParams<{name:string}>();
  const router = useRouter();
  const [data,setData] = useState<Character|undefined>();
  const [ready,setReady] = useState(false);
  useEffect(()=>{(async()=>{ if(!name) return; const d = await getCharacter(decodeURIComponent(name)); setData(d as Character | undefined); setReady(true); })();},[name]);
  if(!ready) return <Container className="py-3"><Alert>Loading...</Alert></Container>;
  if(!data) return <Container className="py-3"><Alert variant="danger">Character not found</Alert></Container>;
  return (
    <Container className="py-3">
      <Button variant="secondary" className="mb-3" onClick={()=>router.back()}>Back</Button>
      <Card style={{width:'20rem'}}>
        {data.icon && <Card.Img variant="top" src={data.icon} alt={`${data.name} profile`} />}
        <Card.Body>
          <Card.Title>{data.name}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">{data.region}</Card.Subtitle>
            <Card.Text>
              <strong>Vision:</strong> {data.vision}<br/>
              <strong>Weapon Type:</strong> {data.weaponType}<br/>
              {data.description}
              {data.talent && <><br/><strong>Talent Material:</strong> {data.talent}</>}
              {data.talentLocation && <><br/><strong>Material Location:</strong> {data.talentLocation}</>}
            </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
}
