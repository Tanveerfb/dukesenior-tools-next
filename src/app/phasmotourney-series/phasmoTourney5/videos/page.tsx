"use client";
import { useEffect, useState } from "react";
import {
  Container,
  Alert,
  Card,
  Badge,
  Spinner,
  Row,
  Col,
  Form,
  Stack,
} from "react-bootstrap";
import { FaYoutube, FaTwitch } from "react-icons/fa";
import { listVideoLinks } from "@/lib/services/phasmoTourney5";
import { formatRoundLabel } from "@/lib/utils";

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

function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

function getTwitchThumbnail(videoId: string): string {
  // Twitch thumbnails require API; use placeholder for now
  return `https://via.placeholder.com/320x180/9147ff/ffffff?text=Twitch+Video`;
}

function VideoCard({ video }: { video: VideoLink }) {
  const [imgError, setImgError] = useState(false);

  const videoId =
    video.platform === "youtube"
      ? extractYouTubeId(video.url)
      : extractTwitchVideoId(video.url);

  const thumbnail =
    video.platform === "youtube" && videoId && !imgError
      ? getYouTubeThumbnail(videoId)
      : video.platform === "twitch" && videoId
      ? getTwitchThumbnail(videoId)
      : null;

  const roundLabel = formatRoundLabel(video.roundId);

  return (
    <Card className="h-100 shadow-sm">
      {thumbnail && (
        <div
          style={{
            position: "relative",
            paddingTop: "56.25%",
            backgroundColor: "#f8f9fa",
          }}
        >
          <img
            src={thumbnail}
            alt={video.title}
            onError={() => setImgError(true)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
            }}
          >
            {video.platform === "youtube" ? (
              <FaYoutube size={24} color="#FF0000" />
            ) : (
              <FaTwitch size={24} color="#9147FF" />
            )}
          </div>
        </div>
      )}
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title as="h3" className="h6 mb-0">
            {video.title}
          </Card.Title>
        </div>
        <Stack direction="horizontal" gap={2} className="mb-2 flex-wrap">
          <Badge bg="secondary">{roundLabel}</Badge>
          <Badge
            bg={video.platform === "youtube" ? "danger" : "primary"}
            className="text-capitalize"
          >
            {video.platform}
          </Badge>
        </Stack>
        {video.notes && <p className="text-muted small mb-2">{video.notes}</p>}
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm btn-outline-primary"
        >
          Watch Video
        </a>
      </Card.Body>
    </Card>
  );
}

export default function Tourney5VideosPage() {
  const [videos, setVideos] = useState<VideoLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRound, setFilterRound] = useState<string>("all");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");

  useEffect(() => {
    (async () => {
      try {
        const data = await listVideoLinks();
        setVideos(data);
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
        <h1 className="h4 fw-semibold mb-3">Phasmo Tourney 5 — Videos</h1>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <h1 className="h4 fw-semibold mb-3">Phasmo Tourney 5 — Videos</h1>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  // Extract available rounds for filter
  const availableRounds = Array.from(
    new Set(videos.filter((v) => v.roundId).map((v) => v.roundId))
  ).sort();

  // Apply filters
  const filteredVideos = videos.filter((video) => {
    if (filterRound !== "all") {
      if (filterRound === "general" && video.roundId) return false;
      if (filterRound !== "general" && video.roundId !== filterRound)
        return false;
    }
    if (filterPlatform !== "all" && video.platform !== filterPlatform)
      return false;
    return true;
  });

  return (
    <Container className="py-4">
      <h1 className="h4 fw-semibold mb-3">Phasmo Tourney 5 — Videos</h1>

      {videos.length === 0 ? (
        <Alert variant="info">
          No videos available yet. Check back soon!
        </Alert>
      ) : (
        <>
          {/* Filters */}
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Row className="g-3">
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold">
                      Filter by Round
                    </Form.Label>
                    <Form.Select
                      value={filterRound}
                      onChange={(e) => setFilterRound(e.target.value)}
                      size="sm"
                    >
                      <option value="all">All Rounds</option>
                      <option value="general">General</option>
                      {availableRounds.map((round) => (
                        <option key={round} value={round}>
                          {formatRoundLabel(round)}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold">
                      Filter by Platform
                    </Form.Label>
                    <Form.Select
                      value={filterPlatform}
                      onChange={(e) => setFilterPlatform(e.target.value)}
                      size="sm"
                    >
                      <option value="all">All Platforms</option>
                      <option value="youtube">YouTube</option>
                      <option value="twitch">Twitch</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Video Grid */}
          {filteredVideos.length === 0 ? (
            <Alert variant="info">
              No videos match the selected filters.
            </Alert>
          ) : (
            <Row className="g-3">
              {filteredVideos.map((video) => (
                <Col key={video.id} xs={12} sm={6} lg={4}>
                  <VideoCard video={video} />
                </Col>
              ))}
            </Row>
          )}
        </>
      )}
    </Container>
  );
}
