// src/components/WatchModal.tsx
import React, { useState, useEffect } from "react";
import {
  X,
  Server,
  Maximize2,
  Minimize2,
  Tv,
  Film,
  Sparkles,
  Layers,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useContinueWatchingStore } from "../store/continueWatchingStore";
import { formatRuntime } from "../utils/formatters";

interface WatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  runtime?: number | null;
  initialSeason?: number;
  initialEpisode?: number;
  totalSeasons?: number;
}

interface StreamServer {
  id: string;
  name: string;
  badge: string;
  getUrl: (type: "movie" | "tv", id: number, s: number, e: number) => string;
}

const STREAM_SERVERS: StreamServer[] = [
  {
    id: "vidsrc-to",
    name: "Server Alpha (VidSrc)",
    badge: "Fast / HD",
    getUrl: (type, id, s, e) =>
      type === "movie"
        ? `https://vidsrc.to/embed/movie/${id}`
        : `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "embed-su",
    name: "Server Beta (EmbedSU)",
    badge: "Multi-Audio",
    getUrl: (type, id, s, e) =>
      type === "movie"
        ? `https://embed.su/embed/movie/${id}`
        : `https://embed.su/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "vidsrc-xyz",
    name: "Server Gamma (VidSrc XYZ)",
    badge: "Reliable",
    getUrl: (type, id, s, e) =>
      type === "movie"
        ? `https://vidsrc.xyz/embed/movie/${id}`
        : `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  },
  {
    id: "multiembed",
    name: "Server Delta (MultiEmbed)",
    badge: "Subtitles",
    getUrl: (type, id, s, e) =>
      type === "movie"
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
  },
];

export const WatchModal: React.FC<WatchModalProps> = ({
  isOpen,
  onClose,
  id,
  mediaType,
  title,
  posterPath,
  backdropPath,
  runtime,
  initialSeason = 1,
  initialEpisode = 1,
  totalSeasons = 1,
}) => {
  const [activeServer, setActiveServer] = useState<string>("vidsrc-to");
  const [season, setSeason] = useState<number>(initialSeason);
  const [episode, setEpisode] = useState<number>(initialEpisode);
  const [customUrl, setCustomUrl] = useState<string>("");
  const [useCustomUrl, setUseCustomUrl] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const { updateProgress } = useContinueWatchingStore();

  // Sync initial episode & season when props change
  useEffect(() => {
    setSeason(initialSeason || 1);
    setEpisode(initialEpisode || 1);
  }, [initialSeason, initialEpisode, isOpen]);

  // Record into Continue Watching store when opened
  useEffect(() => {
    if (isOpen && id) {
      updateProgress({
        id,
        mediaType,
        title:
          mediaType === "tv"
            ? `${title} (S${season} E${episode})`
            : title,
        posterPath: posterPath || null,
        backdropPath: backdropPath || null,
        progressPercentage: 25,
        currentTime: "24m",
        totalTime: runtime ? formatRuntime(runtime) : "45m",
        season: mediaType === "tv" ? season : undefined,
        episode: mediaType === "tv" ? episode : undefined,
      });
    }
  }, [isOpen, id, season, episode, mediaType, title, posterPath, backdropPath, runtime]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullscreen) setIsFullscreen(false);
        else onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isFullscreen, onClose]);

  if (!isOpen) return null;

  const currentServerObj =
    STREAM_SERVERS.find((s) => s.id === activeServer) || STREAM_SERVERS[0];

  const streamSrc = useCustomUrl && customUrl.trim()
    ? customUrl.trim()
    : currentServerObj.getUrl(mediaType, id, season, episode);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isFullscreen ? "p-0" : "p-2 sm:p-4 md:p-6"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* Main Cinema Player Container */}
      <div
        className={`relative z-10 w-full flex flex-col bg-base-900 border border-white/10 shadow-2xl overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? "h-full max-w-full rounded-none"
            : "max-w-6xl h-[90vh] max-h-[850px] rounded-2xl"
        }`}
      >
        {/* Top Player Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-base-800/80">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-1.5 rounded-lg bg-cinema-red text-white flex items-center justify-center">
              {mediaType === "movie" ? (
                <Film className="w-4 h-4" />
              ) : (
                <Tv className="w-4 h-4" />
              )}
            </div>
            <div className="truncate">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                {title}
              </h3>
              {mediaType === "tv" && (
                <p className="text-xs text-cinema-red font-semibold">
                  Season {season} • Episode {episode}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Close Player (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Frame Area */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          <iframe
            key={streamSrc}
            src={streamSrc}
            title={`${title} full stream`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>

        {/* Bottom Stream Controls Bar */}
        <div className="px-4 sm:px-6 py-3 bg-base-800/90 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Server Switcher */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5">
            <span className="font-semibold text-gray-400 flex items-center gap-1.5 flex-shrink-0">
              <Server className="w-3.5 h-3.5 text-cinema-red" />
              <span>Server:</span>
            </span>

            {STREAM_SERVERS.map((server) => (
              <button
                key={server.id}
                onClick={() => {
                  setUseCustomUrl(false);
                  setActiveServer(server.id);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  !useCustomUrl && activeServer === server.id
                    ? "bg-cinema-red text-white shadow-md shadow-cinema-red/30"
                    : "bg-base-700/60 text-gray-300 hover:bg-base-600 hover:text-white"
                }`}
              >
                <span>{server.name}</span>
                <span className="text-[10px] opacity-75">({server.badge})</span>
              </button>
            ))}
          </div>

          {/* TV Episode Selector (If TV Show) */}
          {mediaType === "tv" && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5 bg-base-700/80 px-2.5 py-1 rounded-lg border border-white/5">
                <span className="text-gray-400">S:</span>
                <select
                  value={season}
                  onChange={(e) => {
                    setSeason(Number(e.target.value));
                    setEpisode(1);
                  }}
                  className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                >
                  {Array.from({ length: Math.max(1, totalSeasons) }).map((_, i) => (
                    <option key={i + 1} value={i + 1} className="bg-base-800">
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-1.5 bg-base-700/80 px-2.5 py-1 rounded-lg border border-white/5">
                <span className="text-gray-400">Ep:</span>
                <select
                  value={episode}
                  onChange={(e) => setEpisode(Number(e.target.value))}
                  className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                >
                  {Array.from({ length: 30 }).map((_, i) => (
                    <option key={i + 1} value={i + 1} className="bg-base-800">
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              {/* Next Episode Button */}
              <button
                onClick={() => setEpisode((prev) => prev + 1)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-base-700 hover:bg-base-600 text-white font-medium transition-colors"
                title="Next Episode"
              >
                <span>Next Ep</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
