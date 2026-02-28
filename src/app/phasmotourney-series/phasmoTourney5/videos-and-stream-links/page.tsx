"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
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
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 p-3 text-yellow-800 dark:text-yellow-200 text-sm">
          Invalid YouTube URL
        </div>
      );
    }
    return (
      <div className="relative w-full aspect-video">
        <iframe
          className="absolute inset-0 w-full h-full"
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
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 p-3 text-yellow-800 dark:text-yellow-200 text-sm">
          Invalid Twitch URL. Please use a video URL format (VOD).
        </div>
      );
    }
    // Twitch requires parent domain for iframe embedding
    // TODO: Move to environment config
    const ALLOWED_DOMAINS = ["localhost", "dukesenior-tools.web.app"];
    const currentHost =
      typeof window !== "undefined" ? window.location.hostname : "";
    const parentDomain = ALLOWED_DOMAINS.includes(currentHost)
      ? currentHost
      : ALLOWED_DOMAINS[1];
    return (
      <div className="relative w-full aspect-video">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://player.twitch.tv/?video=${videoId}&parent=${parentDomain}`}
          title={link.title}
          allowFullScreen
        />
      </div>
    );
  }
  return null;
}

function VideoCard({ link }: { link: VideoLink }) {
  return (
    <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm h-full p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-base font-semibold text-foreground">
          {link.title}
        </h3>
        <span
          className={cn(
            "rounded-full text-xs font-medium px-2.5 py-0.5 capitalize shrink-0 ml-2",
            link.platform === "youtube"
              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
          )}
        >
          {link.platform}
        </span>
      </div>
      {link.notes && (
        <p className="text-muted-foreground text-sm mb-2">{link.notes}</p>
      )}
      <VideoEmbed link={link} />
    </div>
  );
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
      <div className="max-w-7xl mx-auto px-4 py-4">
        <h1 className="text-lg font-semibold mb-3 text-foreground">
          Phasmo Tourney 5 — Videos &amp; Stream Links
        </h1>
        <div className="text-center py-10">
          <svg
            className="animate-spin h-8 w-8 text-primary-500 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-4">
        <h1 className="text-lg font-semibold mb-3 text-foreground">
          Phasmo Tourney 5 — Videos &amp; Stream Links
        </h1>
        <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700 p-3 text-red-800 dark:text-red-200">
          {error}
        </div>
      </div>
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
    <div className="max-w-7xl mx-auto px-4 py-4">
      <h1 className="text-lg font-semibold mb-3 text-foreground">
        Phasmo Tourney 5 — Videos &amp; Stream Links
      </h1>

      {links.length === 0 ? (
        <div className="rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700 p-3 text-blue-800 dark:text-blue-200">
          No videos or streams available yet. Check back soon!
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {generalLinks.length > 0 && (
            <div>
              <h2 className="text-base font-semibold mb-3 text-foreground">
                General Videos
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {generalLinks.map((link) => (
                  <VideoCard key={link.id} link={link} />
                ))}
              </div>
            </div>
          )}

          {rounds.map((roundId) => (
            <div key={roundId}>
              <h2 className="text-base font-semibold mb-3 capitalize text-foreground">
                {roundId.replace(/round(\d+)/, "Round $1")}
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {linksByRound[roundId].map((link) => (
                  <VideoCard key={link.id} link={link} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
