// src/components/VideoModal.tsx
import React, { useEffect } from "react";
import { X, Film } from "lucide-react";
import type { Video } from "../services/types";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  videos?: Video[];
  activeVideoKey?: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  title,
  videos = [],
  activeVideoKey,
}) => {
  const [selectedKey, setSelectedKey] = React.useState<string | null>(null);

  // Pick the best trailer or first video
  useEffect(() => {
    if (activeVideoKey) {
      setSelectedKey(activeVideoKey);
    } else if (videos && videos.length > 0) {
      const trailer =
        videos.find((v) => v.type === "Trailer" && v.site === "YouTube") ||
        videos.find((v) => v.site === "YouTube") ||
        videos[0];
      setSelectedKey(trailer?.key || null);
    } else {
      setSelectedKey(null);
    }
  }, [videos, activeVideoKey, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const youtubeVideos = videos.filter((v) => v.site === "YouTube");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-5xl bg-base-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-base-800/60">
          <div className="flex items-center space-x-3">
            <Film className="w-5 h-5 text-cinema-red" />
            <h3 className="text-lg font-semibold text-white truncate max-w-md">
              {title} — Trailer & Clips
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close trailer modal"
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Video Player Box */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          {selectedKey ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${selectedKey}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
              title={`${title} trailer`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="text-center p-8 text-gray-400">
              <Film className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-base font-medium">No official video or trailer found for this title.</p>
              <p className="text-xs text-gray-500 mt-1">TMDB might not have licensed video clips for this entry yet.</p>
            </div>
          )}
        </div>

        {/* Video switcher tabs if multiple available */}
        {youtubeVideos.length > 1 && (
          <div className="p-3 bg-base-800/80 border-t border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-semibold uppercase text-gray-400 mr-2 flex-shrink-0">
              Available Clips ({youtubeVideos.length}):
            </span>
            {youtubeVideos.map((vid) => (
              <button
                key={vid.id || vid.key}
                onClick={() => setSelectedKey(vid.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedKey === vid.key
                    ? "bg-cinema-red text-white shadow-md shadow-cinema-red/30"
                    : "bg-base-700/70 text-gray-300 hover:bg-base-600 hover:text-white"
                }`}
              >
                {vid.name || vid.type}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
