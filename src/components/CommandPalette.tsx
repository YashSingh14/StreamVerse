// src/components/CommandPalette.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Film, Tv, Home, Compass, Bookmark, Key, X, Star } from "lucide-react";
import { useSearchMulti } from "../hooks/useTmdb";
import { formatRating, formatYear } from "../utils/formatters";
import { BlurImage } from "./BlurImage";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApiKeyModal: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenApiKeyModal,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: searchResults, isLoading } = useSearchMulti(query);

  const results =
    searchResults?.pages?.flatMap((page) => page.results).slice(0, 8) || [];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Palette Box */}
      <div className="relative z-10 w-full max-w-2xl bg-base-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 bg-base-800/50">
          <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, TV shows, actors, or pages..."
            className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none text-base"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-full text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-3 px-2 py-0.5 text-xs text-gray-400 bg-base-700/60 border border-white/10 rounded">
            ESC
          </kbd>
        </div>

        {/* Content Area */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-white/5">
          {/* Quick Page Links if query is empty */}
          {!query.trim() && (
            <div className="p-2 space-y-1">
              <div className="px-3 py-1.5 text-xs font-semibold uppercase text-gray-400">
                Navigation Shortcuts
              </div>
              <button
                onClick={() => handleSelect("/")}
                className="w-full flex items-center px-3 py-2.5 rounded-xl hover:bg-white/10 text-gray-200 hover:text-white transition-colors text-sm"
              >
                <Home className="w-4 h-4 mr-3 text-cinema-red" />
                <span>Home</span>
              </button>
              <button
                onClick={() => handleSelect("/browse")}
                className="w-full flex items-center px-3 py-2.5 rounded-xl hover:bg-white/10 text-gray-200 hover:text-white transition-colors text-sm"
              >
                <Compass className="w-4 h-4 mr-3 text-indigo-400" />
                <span>Browse & Filter Universe</span>
              </button>
              <button
                onClick={() => handleSelect("/watchlist")}
                className="w-full flex items-center px-3 py-2.5 rounded-xl hover:bg-white/10 text-gray-200 hover:text-white transition-colors text-sm"
              >
                <Bookmark className="w-4 h-4 mr-3 text-amber-400" />
                <span>My List & Favorites</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenApiKeyModal();
                }}
                className="w-full flex items-center px-3 py-2.5 rounded-xl hover:bg-white/10 text-gray-200 hover:text-white transition-colors text-sm"
              >
                <Key className="w-4 h-4 mr-3 text-emerald-400" />
                <span>Configure TMDB API Key</span>
              </button>
            </div>
          )}

          {/* Search Results */}
          {query.trim() && (
            <div className="p-2 space-y-1">
              <div className="px-3 py-1.5 text-xs font-semibold uppercase text-gray-400 flex items-center justify-between">
                <span>Results</span>
                {isLoading && <span className="text-gray-500">Searching...</span>}
              </div>

              {results.length > 0 ? (
                results.map((item) => {
                  const mediaType = item.media_type || (item.first_air_date ? "tv" : "movie");
                  const title = item.title || item.name || "Untitled";
                  const date = item.release_date || item.first_air_date;

                  return (
                    <button
                      key={`${item.media_type}-${item.id}`}
                      onClick={() => handleSelect(`/${mediaType}/${item.id}`)}
                      className="w-full flex items-center p-2 rounded-xl hover:bg-white/10 text-left transition-colors group"
                    >
                      <div className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-base-800 border border-white/5 mr-3">
                        <BlurImage
                          path={item.poster_path || item.profile_path}
                          alt={title}
                          size="w200"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-semibold text-white truncate group-hover:text-cinema-red transition-colors">
                            {title}
                          </h4>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-base-700 text-gray-300 uppercase">
                            {mediaType}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-gray-400 mt-1">
                          <span>{formatYear(date)}</span>
                          {item.vote_average !== undefined && item.vote_average > 0 && (
                            <span className="flex items-center text-amber-400">
                              <Star className="w-3 h-3 fill-amber-400 mr-1" />
                              {formatRating(item.vote_average)}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : !isLoading ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No titles found for "{query}"</p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
