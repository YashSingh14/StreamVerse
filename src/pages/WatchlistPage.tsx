// src/pages/WatchlistPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, Heart, Clock, Trash2, Play, Compass, Film } from "lucide-react";
import { useWatchlistStore } from "../store/watchlistStore";
import { useContinueWatchingStore } from "../store/continueWatchingStore";
import { BlurImage } from "../components/BlurImage";
import { VideoModal } from "../components/VideoModal";
import { formatRating, formatYear } from "../utils/formatters";

export const WatchlistPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"watchlist" | "favorites" | "continue">("watchlist");
  const [modalVideo, setModalVideo] = useState<{ isOpen: boolean; title: string }>({
    isOpen: false,
    title: "",
  });

  const { watchlist, favorites, removeFromWatchlist, toggleFavorite } = useWatchlistStore();
  const { items: continueItems, removeItem: removeContinueItem } = useContinueWatchingStore();

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-cinema-red/10 text-cinema-red border border-cinema-red/20">
              <Bookmark className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              My Library & Watchlist
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 ml-11">
            Your saved movies, television series, and in-progress playback
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-base-800/80 p-1.5 rounded-2xl border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("watchlist")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "watchlist"
                ? "bg-cinema-red text-white shadow-lg shadow-cinema-red/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Watchlist ({watchlist.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "favorites"
                ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Favorites ({favorites.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("continue")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "continue"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>In Progress ({continueItems.length})</span>
          </button>
        </div>
      </div>

      {/* Content View */}
      {activeTab === "watchlist" && (
        watchlist.length === 0 ? (
          <EmptyState
            title="Your Watchlist is Empty"
            description="Explore trending titles and click '+' to save them here for later viewing."
            onExplore={() => navigate("/browse")}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {watchlist.map((item) => (
              <div
                key={`wl-${item.mediaType}-${item.id}`}
                onClick={() => navigate(`/${item.mediaType}/${item.id}`)}
                className="group relative rounded-xl overflow-hidden bg-base-800 border border-white/5 hover:border-white/20 shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1.5"
              >
                <div className="relative aspect-[2/3] w-full">
                  <BlurImage path={item.posterPath} alt={item.title} size="w500" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWatchlist(item.id, item.mediaType);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-cinema-red text-white transition-colors"
                    title="Remove from watchlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-2.5">
                  <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                    <span>{formatYear(item.releaseDate)}</span>
                    <span className="capitalize">{item.mediaType}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === "favorites" && (
        favorites.length === 0 ? (
          <EmptyState
            title="No Favorites Added Yet"
            description="Click the heart icon on any title you love to keep quick access here."
            onExplore={() => navigate("/browse")}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {favorites.map((item) => (
              <div
                key={`fav-${item.mediaType}-${item.id}`}
                onClick={() => navigate(`/${item.mediaType}/${item.id}`)}
                className="group relative rounded-xl overflow-hidden bg-base-800 border border-white/5 hover:border-white/20 shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1.5"
              >
                <div className="relative aspect-[2/3] w-full">
                  <BlurImage path={item.posterPath} alt={item.title} size="w500" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-rose-500 hover:text-white hover:bg-cinema-red transition-colors"
                    title="Remove favorite"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
                <div className="p-2.5">
                  <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                    <span>{formatYear(item.releaseDate)}</span>
                    <span className="capitalize">{item.mediaType}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === "continue" && (
        continueItems.length === 0 ? (
          <EmptyState
            title="No Titles in Progress"
            description="When you start watching trailers and episodes, your playback progress will appear here."
            onExplore={() => navigate("/")}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {continueItems.map((item) => (
              <div
                key={`cw-${item.mediaType}-${item.id}`}
                onClick={() => navigate(`/${item.mediaType}/${item.id}`)}
                className="group relative rounded-xl overflow-hidden bg-base-800 border border-white/5 hover:border-white/20 shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1.5"
              >
                <div className="relative aspect-video w-full">
                  <BlurImage
                    path={item.backdropPath || item.posterPath}
                    alt={item.title}
                    size="w500"
                    aspectRatio="aspect-video"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalVideo({ isOpen: true, title: item.title });
                      }}
                      className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeContinueItem(item.id, item.mediaType);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-cinema-red text-white transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {/* Progress */}
                  <div className="absolute bottom-0 inset-x-0 h-1.5 bg-gray-700/80">
                    <div
                      className="h-full bg-cinema-red"
                      style={{ width: `${item.progressPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="p-3">
                  <h4 className="text-sm font-semibold text-white truncate">{item.title}</h4>
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                    <span>
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
        )
      )}

      {/* Video Modal */}
      <VideoModal
        isOpen={modalVideo.isOpen}
        onClose={() => setModalVideo((prev) => ({ ...prev, isOpen: false }))}
        title={modalVideo.title}
      />
    </div>
  );
};

// Reusable Empty State component
const EmptyState: React.FC<{
  title: string;
  description: string;
  onExplore: () => void;
}> = ({ title, description, onExplore }) => (
  <div className="text-center py-24 bg-base-900/40 rounded-2xl border border-white/5 p-8 max-w-md mx-auto space-y-4">
    <div className="w-16 h-16 rounded-full bg-base-800/80 border border-white/10 flex items-center justify-center mx-auto text-gray-400">
      <Film className="w-8 h-8 text-cinema-red/80" />
    </div>
    <div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="text-xs text-gray-400 mt-1 leading-relaxed">{description}</p>
    </div>
    <button
      onClick={onExplore}
      className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cinema-red hover:bg-cinema-hover text-white text-xs font-semibold shadow-lg shadow-cinema-red/30 transition-all active:scale-95"
    >
      <Compass className="w-4 h-4" />
      <span>Explore StreamVerse</span>
    </button>
  </div>
);
