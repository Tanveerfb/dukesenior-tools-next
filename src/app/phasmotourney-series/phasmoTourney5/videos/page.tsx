"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
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
    <div className="h-full rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark shadow-sm overflow-hidden">
      {thumbnail && (
        <div className="relative pt-[56.25%] bg-gray-100 dark:bg-gray-800">
          <img
            src={thumbnail}
            alt={video.title}
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            {video.platform === "youtube" ? (
              <FaYoutube size={24} color="#FF0000" />
            ) : (
              <FaTwitch size={24} color="#9147FF" />
            )}
          </div>
        </div>
      )}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-semibold m-0">{video.title}</h3>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-gray-500 text-white">
            {roundLabel}
          </span>
          <span
            className={cn(
              "rounded-full text-xs font-medium px-2.5 py-0.5 capitalize",
              video.platform === "youtube"
                ? "bg-red-600 text-white"
                : "bg-primary-500 text-white",
            )}
          >
            {video.platform}
          </span>
        </div>
        {video.notes && (
          <p className="text-foreground/50 text-sm mb-2">{video.notes}</p>
        )}
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-lg border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white px-3 py-1 text-sm font-medium transition-colors"
        >
          Watch Video
        </a>
      </div>
    </div>
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
      <div className="max-w-7xl mx-auto px-4 py-4">
        <h1 className="text-lg font-semibold mb-3">
          Phasmo Tourney 5 — Videos
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
        <h1 className="text-lg font-semibold mb-3">
          Phasmo Tourney 5 — Videos
        </h1>
        <div className="rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-800 dark:text-red-300">
          {error}
        </div>
      </div>
    );
  }

  // Extract available rounds for filter
  const availableRounds = Array.from(
    new Set(videos.filter((v) => v.roundId).map((v) => v.roundId)),
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
    <div className="max-w-7xl mx-auto px-4 py-4">
      <h1 className="text-lg font-semibold mb-3">Phasmo Tourney 5 — Videos</h1>

      {videos.length === 0 ? (
        <div className="rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 px-4 py-3 text-sm text-blue-800 dark:text-blue-300">
          No videos available yet. Check back soon!
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark shadow-sm mb-4">
            <div className="p-4">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-semibold mb-1">
                    Filter by Round
                  </label>
                  <select
                    value={filterRound}
                    onChange={(e) => setFilterRound(e.target.value)}
                    className="w-full rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-foreground px-3 py-1.5 text-sm"
                  >
                    <option value="all">All Rounds</option>
                    <option value="general">General</option>
                    {availableRounds.map((round) => (
                      <option key={round} value={round}>
                        {formatRoundLabel(round)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-semibold mb-1">
                    Filter by Platform
                  </label>
                  <select
                    value={filterPlatform}
                    onChange={(e) => setFilterPlatform(e.target.value)}
                    className="w-full rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-foreground px-3 py-1.5 text-sm"
                  >
                    <option value="all">All Platforms</option>
                    <option value="youtube">YouTube</option>
                    <option value="twitch">Twitch</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Video Grid */}
          {filteredVideos.length === 0 ? (
            <div className="rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 px-4 py-3 text-sm text-blue-800 dark:text-blue-300">
              No videos match the selected filters.
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-3">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  className="col-span-12 sm:col-span-6 lg:col-span-4"
                >
                  <VideoCard video={video} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
