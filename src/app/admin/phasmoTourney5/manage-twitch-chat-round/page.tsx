"use client";
import { Container, Card } from "react-bootstrap";
import MatchSettingsEditor from "@/components/tourney/MatchSettingsEditor";
import TwitchPollResultsCard from "@/components/tourney/TwitchPollResultsCard";
import EliminatorCard from "@/components/tourney/EliminatorCard";

export default function ManageTwitchChatRoundPage() {
  return (
    <Container className="py-4">
      <h1 className="h4 fw-semibold mb-3">
        Round 4 — Twitch Chat Round (Admin)
      </h1>

      {/* Assign per-match settings */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Card.Title as="h2" className="h5 fw-semibold">
            Match Settings
          </Card.Title>
          <MatchSettingsEditor matchNumber={1} />
          <MatchSettingsEditor matchNumber={2} />
          <MatchSettingsEditor matchNumber={3} />
        </Card.Body>
      </Card>

      {/* Twitch poll results capture */}
      <TwitchPollResultsCard />

      {/* Eliminator variant with player count options 2/3/5 */}
      <section className="mt-4">
        <EliminatorCard playerCountOptions={[2, 3, 5]} />
      </section>
    </Container>
  );
}
