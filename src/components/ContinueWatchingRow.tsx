// src/components/ContinueWatchingRow.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Play, X, Clock } from "lucide-react";
import { BlurImage } from "./BlurImage";
import { useContinueWatchingStore } from "../store/continueWatchingStore";

interface ContinueWatchingRowProps {
  onPlayItem?: (title: string, id: number, mediaType: "movie" | "tv") => void;
}

export const ContinueWatchingRow: React.FC<ContinueWatchingRowProps> = ({ onPlayItem }) => {
  const navigate = useNavigate();
  const { items, removeItem } = useContinueWatchingStore();

  if (!items || items.length === 0) return null;

  return (
    <div className="py-4 px-4 sm:px-8 md:px-12">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide flex items-center gap-2">
          <span className="w-1 h-5 bg-cinema-red rounded-full inline-block"></span>
          Continue Watching
        </h2>
      </div>

      <div className="flex space-x-4 overflow-x-auto no-scrollbar py-2">
        {items.map((item) => (
          <div
            key={`${item.mediaType}-${item.id}`}
            onClick={() => navigate(`/${item.mediaType}/${item.id}`)}
            className="group relative flex-shrink-0 w-60 sm:w-72 rounded-xl overflow-hidden bg-base-800 border border-white/10 hover:border-white/20 shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1.5"
          >
            {/* Backdrop image */}
            <div className="relative aspect-video w-full overflow-hidden bg-base-900">
              <BlurImage
                path={item.backdropPath || item.posterPath}
                alt={item.title}
                size="w500"
                aspectRatio="aspect-video"
                className="group-hover:scale-105 transition-transform duration-500"
              />

              {/* Play overlay button */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onPlayItem) onPlayItem(item.title, item.id, item.mediaType);
                    else navigate(`/${item.mediaType}/${item.id}`);
                  }}
                  className="w-12 h-12 rounded-full bg-white/90 text-black flex items-center justify-center group-hover:bg-cinema-red group-hover:text-white group-hover:scale-110 transition-all shadow-xl"
                  title="Resume"
                  aria-label={`Resume ${item.title}`}
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem(item.id, item.mediaType);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-gray-300 hover:text-white hover:bg-black/90 transition-colors z-10"
                title="Remove from Continue Watching"
                aria-label="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Progress Bar at bottom of thumbnail */}
              <div className="absolute bottom-0 inset-x-0 h-1.5 bg-gray-700/80">
                <div
                  className="h-full bg-cinema-red transition-all duration-300"
                  style={{ width: `${item.progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Meta */}
            <div className="p-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white truncate max-w-[180px]">
                  {item.title}
                </h4>
                {item.season && item.episode && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-base-700 text-gray-300 font-mono">
                    S{item.season} E{item.episode}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  {item.currentTime} / {item.totalTime}
                </span>
                <span className="text-cinema-red font-medium">
                  {item.progressPercentage}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
