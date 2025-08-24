"use client";
import { useState } from 'react';
import { Button, Card, Container, Table } from 'react-bootstrap';

const ghosts = [
  ['Spirit','Wraith','Phantom'],
  ['Poltergeist','Banshee','Jinn'],
  ['Mare','Revenant','Shade'],
  ['Demon','Yurei','Oni'],
  ['Yokai','Hantu','Goryo'],
  ['Myling','Onryo','The Twins'],
  ['Raiju','Obake','The Mimic'],
  ['Moroi','Deogen','Thaye']
];

export default function PhasmoWikiPage(){
  const [visible,setVisible] = useState(false);
  return (
    <Container fluid="lg" className="px-3 d-flex flex-column">
      <Button className="m-1" disabled>Add ghost info</Button>
      <Table bordered className="text-center">
        <tbody>
          {ghosts.map((row,i)=>(
            <tr key={i}>
              {row.map((g,j)=>(
                <td key={j}><Button variant="link" className="p-0" onClick={()=> setVisible(v=> !v)}>{g}</Button></td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
      <Container>
        {visible && (
          <Card><Card.Body>
            Spirits are very common ghosts. They are very powerful, but passive, only attacking when they need to. They defend their place of death to the utmost degree, killing anyone that is caught overstaying their welcome.
          </Card.Body></Card>
        )}
      </Container>
    </Container>
  );
}
