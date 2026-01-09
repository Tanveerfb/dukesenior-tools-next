"use client";
import { useEffect, useState } from "react";
import {
  Container,
  Alert,
  Card,
  Badge,
  Spinner,
  Stack,
  Row,
  Col,
} from "react-bootstrap";
import { listVideoLinks } from "@/lib/services/phasmoTourney5";

interface VideoLink {
  id: string;
  title: string;
  url: string;
  platform: "youtube" | "twitch";
  roundId?: string;
  notes?: string;
  createdAt: number;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function extractTwitchVideoId(url: string): string | null {
  const match = url.match(/twitch\.tv\/videos\/(\d+)/);
  return match ? match[1] : null;
}

function VideoEmbed({ link }: { link: VideoLink }) {
  if (link.platform === "youtube") {
    const videoId = extractYouTubeId(link.url);
    if (!videoId) {
      return (
        <Alert variant="warning" className="mb-0">
          Invalid YouTube URL
        </Alert>
      );
    }
    return (
      <div className="ratio ratio-16x9">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={link.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  } else if (link.platform === "twitch") {
    const videoId = extractTwitchVideoId(link.url);
    if (!videoId) {
      return (
        <Alert variant="warning" className="mb-0">
          Invalid Twitch URL. Please use a video URL format (VOD).
        </Alert>
      );
    }
    // Twitch requires parent domain for iframe embedding
    // TODO: Move to environment config
    const ALLOWED_DOMAINS = ['localhost', 'dukesenior-tools.web.app'];
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
    const parentDomain = ALLOWED_DOMAINS.includes(currentHost) 
      ? currentHost 
      : ALLOWED_DOMAINS[1];
    return (
      <div className="ratio ratio-16x9">
        <iframe
          src={`https://player.twitch.tv/?video=${videoId}&parent=${parentDomain}`}
          title={link.title}
          allowFullScreen
        />
      </div>
    );
  }
  return null;
}

export default function Tourney5VideosStreamsPage() {
  const [links, setLinks] = useState<VideoLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await listVideoLinks();
        setLinks(data);
      } catch (e: any) {
        setError(e?.message || "Failed to load videos");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <Container className="py-4">
        <h1 className="h4 fw-semibold mb-3">
          Phasmo Tourney 5 — Videos & Stream Links
        </h1>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <h1 className="h4 fw-semibold mb-3">
          Phasmo Tourney 5 — Videos & Stream Links
        </h1>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const linksByRound: Record<string, VideoLink[]> = {};
  const generalLinks: VideoLink[] = [];

  links.forEach((link) => {
    if (link.roundId) {
      if (!linksByRound[link.roundId]) {
        linksByRound[link.roundId] = [];
      }
      linksByRound[link.roundId].push(link);
    } else {
      generalLinks.push(link);
    }
  });

  const rounds = Object.keys(linksByRound).sort();

  return (
    <Container className="py-4">
      <h1 className="h4 fw-semibold mb-3">
        Phasmo Tourney 5 — Videos & Stream Links
      </h1>

      {links.length === 0 ? (
        <Alert variant="info">
          No videos or streams available yet. Check back soon!
        </Alert>
      ) : (
        <Stack gap={4}>
          {generalLinks.length > 0 && (
            <div>
              <h2 className="h5 mb-3">General Videos</h2>
              <Row className="g-3">
                {generalLinks.map((link) => (
                  <Col key={link.id} xs={12} lg={6}>
                    <Card className="shadow-sm h-100">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <Card.Title as="h3" className="h6 mb-0">
                            {link.title}
                          </Card.Title>
                          <Badge
                            bg={
                              link.platform === "youtube" ? "danger" : "secondary"
                            }
                            className="text-capitalize"
                          >
                            {link.platform}
                          </Badge>
                        </div>
                        {link.notes && (
                          <p className="text-muted small mb-2">{link.notes}</p>
                        )}
                        <VideoEmbed link={link} />
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {rounds.map((roundId) => (
            <div key={roundId}>
              <h2 className="h5 mb-3 text-capitalize">
                {roundId.replace(/round(\d+)/, "Round $1")}
              </h2>
              <Row className="g-3">
                {linksByRound[roundId].map((link) => (
                  <Col key={link.id} xs={12} lg={6}>
                    <Card className="shadow-sm h-100">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <Card.Title as="h3" className="h6 mb-0">
                            {link.title}
                          </Card.Title>
                          <Badge
                            bg={
                              link.platform === "youtube" ? "danger" : "secondary"
                            }
                            className="text-capitalize"
                          >
                            {link.platform}
                          </Badge>
                        </div>
                        {link.notes && (
                          <p className="text-muted small mb-2">{link.notes}</p>
                        )}
                        <VideoEmbed link={link} />
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          ))}
        </Stack>
      )}
    </Container>
  );
}
