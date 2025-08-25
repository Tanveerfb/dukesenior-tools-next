import React from 'react';
import { Container, Alert } from 'react-bootstrap';

const rounds = [
  {
    title: 'Round 1 (Group matches) [Ridgeview Court]',
    note: '4 Eliminated players can choose to grab another fighting chance in Second Chance Bracket',
    matches: [
      'Match 1 : Ram_Fighter vs <b>patsas</b>',
      'Match 2 : <b>KosmicHippie</b> vs Hannah_49_',
      'Match 3 : Enokiacat vs <b>Gre_Kaz</b>',
      'Match 4 : bgflareon vs <b>Izumiachi</b>',
    ],
  },
  {
    title: 'Round 2 (Group matches) [Willow street]',
    note: '1 player was eliminated at the end of Round 2',
    matches: [
      'Match 5 : <b>Izumiachi</b> vs patsas',
      'Match 6 : <b>KosmicHippie</b> vs Kaz',
      'Match 7 : <b>Izumiachi</b> vs Kaz',
      'Match 8 : <b>KosmicHippie</b> vs patsas',
    ],
  },
  {
    title: 'Second Chance Bracket [Tanglewood Drive]',
    note: 'Winner earned a chance to play in the playoffs',
    matches: ['SCB Elimination Match : @Hannah_49_ vs <b>@bgflareon</b> vs @Ram_Fighter vs @Gre_Kaz'],
  },
  {
    title: 'Round 3 (Play offs) [Grafton Farmhouse]',
    note: '2 players were eliminated from the tourney at the end of Round 3',
    matches: ['Match 9 : <b>Izumiachi</b> vs KosmicHippie', 'Match 10 : patsas vs <b>bgflareon</b>', 'Match 11 : <b>KosmicHippie</b> vs bgflareon'],
  },
  {
    title: 'Round 4 (Final) [Sunny Meadows Restricted]',
    note: 'The winner of the tournament was decided in this round!',
    matches: ['Final [Best out of 3] : <b>Izumiachi</b> vs KosmicHippie'],
  },
];

export default function PhasmoTourney2BracketPage() {
  return (
    <Container fluid className="py-3">
      <h2 className="mb-2">Phasmo Tourney 2 — Brackets</h2>
      <Alert className="mb-3">The brackets of the tournament. <br /> <strong>Bold</strong> denotes the winner in each match.</Alert>

      <div className="d-flex flex-column gap-3">
        {rounds.map((r, i) => (
          <div className="card" key={i}>
            <div className="card-header fw-bold">{r.title}</div>
              <div className="card-body">
                <ul className="list-group mb-0">
                  {r.matches && r.matches.map((m, idx) => (
                    <li className="list-group-item" key={`${i}-${idx}`} dangerouslySetInnerHTML={{ __html: m }} />
                  ))}
                </ul>
              </div>
            <div className="card-footer small text-muted">{r.note}</div>
          </div>
        ))}
      </div>
    </Container>
  );
}
