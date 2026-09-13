// src/components/WatchModal.tsx
import React, { useState, useEffect } from "react";
import {
  X,
  Server,
  Maximize2,
  Minimize2,
  Tv,
  Film,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Sparkles,
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
    id: "vidlink",
    name: "Server 1 (VidLink)",
    badge: "Clean HD",
    getUrl: (type, id, s, e) =>
      type === "movie"
        ? `https://vidlink.pro/movie/${id}?primaryColor=e50914&secondaryColor=141419&iconColor=ffffff`
        : `https://vidlink.pro/tv/${id}/${s}/${e}?primaryColor=e50914&secondaryColor=141419&iconColor=ffffff`,
  },
  {
    id: "vidsrc-me",
    name: "Server 2 (VidSrc Prime)",
    badge: "1080p / Fast",
    getUrl: (type, id, s, e) =>
      type === "movie"
        ? `https://vidsrc.me/embed/movie?tmdb=${id}`
        : `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  },
  {
    id: "autoembed",
    name: "Server 3 (AutoEmbed)",
    badge: "Ultra HD",
    getUrl: (type, id, s, e) =>
      type === "movie"
        ? `https://autoembed.co/movie/tmdb/${id}`
        : `https://autoembed.co/tv/tmdb/${id}-${s}-${e}`,
  },
  {
    id: "2embed",
    name: "Server 4 (2Embed)",
    badge: "Multi-Sub",
    getUrl: (type, id, s, e) =>
      type === "movie"
        ? `https://2embed.cc/embed/${id}`
        : `https://2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
  },
  {
    id: "vidsrc-pm",
    name: "Server 5 (VidSrc PM)",
    badge: "Backup CDN",
    getUrl: (type, id, s, e) =>
      type === "movie"
        ? `https://vidsrc.pm/embed/movie/${id}`
        : `https://vidsrc.pm/embed/tv/${id}/${s}/${e}`,
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
  const [activeServer, setActiveServer] = useState<string>("vidlink");
  const [season, setSeason] = useState<number>(initialSeason);
  const [episode, setEpisode] = useState<number>(initialEpisode);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);

  const { updateProgress } = useContinueWatchingStore();

  // Sync initial episode & season when props change
  useEffect(() => {
    setSeason(initialSeason || 1);
    setEpisode(initialEpisode || 1);
  }, [initialSeason, initialEpisode, isOpen]);

  // Anti-popup protection without triggering sandbox detection
  useEffect(() => {
    if (!isOpen) return;

    // Defuse window.open popup spam
    const originalOpen = window.open;
    window.open = (url?: string | URL, target?: string, features?: string) => {
      console.warn("[StreamVerse] Blocked popup attempt to:", url);
      return null;
    };

    return () => {
      window.open = originalOpen;
    };
  }, [isOpen]);

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

  const streamSrc = currentServerObj.getUrl(mediaType, id, season, episode);

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
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-base-800/90">
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

          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* Popup Guard Active Badge */}
            <div
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950/60 border border-emerald-500/40 text-emerald-300"
              title="Automatic popup shield is active"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Popup Guard Active</span>
            </div>

            {/* Reload button if stream stalls */}
            <button
              onClick={() => setReloadKey((prev) => prev + 1)}
              className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Reload Stream"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Direct External Player */}
            <a
              href={streamSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-base-700/80 hover:bg-base-600 text-gray-200 hover:text-white border border-white/10 text-xs font-medium transition-colors"
              title="Open stream in a clean external browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">External Tab</span>
            </a>

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

        {/* Video Player Frame Area (No Sandbox attribute to avoid server anti-sandbox trigger) */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          <iframe
            key={`${streamSrc}-${reloadKey}`}
            src={streamSrc}
            title={`${title} stream`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>

        {/* Quality Tip & Server Status Bar */}
        <div className="px-4 py-2 bg-base-950/80 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-300">
          <div className="flex items-center gap-1.5 truncate">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Quality Tip:</strong> Click the ⚙️ gear icon inside the player to lock to <strong>1080p</strong> instead of Auto.
            </span>
          </div>
          <span className="hidden sm:inline text-gray-400 text-[10px]">
            Switch servers if one buffers
          </span>
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
                onClick={() => setActiveServer(server.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeServer === server.id
                    ? "bg-cinema-red text-white shadow-md shadow-cinema-red/30 font-bold"
                    : "bg-base-700/60 text-gray-300 hover:bg-base-600 hover:text-white"
                }`}
              >
                <span>{server.name}</span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-black/30 text-gray-300">
                  {server.badge}
                </span>
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
