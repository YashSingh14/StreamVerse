// src/pages/SearchPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { Search, X, Film, Tv, User, Sparkles } from "lucide-react";
import { useSearchMulti } from "../hooks/useTmdb";
import { MediaCard } from "../components/MediaCard";
import { BlurImage } from "../components/BlurImage";
import { GridSkeleton } from "../components/Skeletons";
import { VideoModal } from "../components/VideoModal";
import type { SearchMultiResult, Video } from "../services/types";

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "movie" | "tv" | "person">("all");
  const [modalVideo, setModalVideo] = useState<{
    isOpen: boolean;
    title: string;
    videos?: Video[];
  }>({ isOpen: false, title: "" });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading, isFetching } = useSearchMulti(debouncedQuery);

  const allResults =
    data?.pages.flatMap((page) => page.results) || [];

  const filteredResults = allResults.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "movie") return item.media_type === "movie" || item.release_date;
    if (activeTab === "tv") return item.media_type === "tv" || item.first_air_date;
    if (activeTab === "person") return item.media_type === "person";
    return true;
  });

  const countFor = (type: "all" | "movie" | "tv" | "person") => {
    if (type === "all") return allResults.length;
    if (type === "movie") return allResults.filter((i) => i.media_type === "movie" || i.release_date).length;
    if (type === "tv") return allResults.filter((i) => i.media_type === "tv" || i.first_air_date).length;
    if (type === "person") return allResults.filter((i) => i.media_type === "person").length;
    return 0;
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Search Header and Input */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Universal Search
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Instant search across movies, series, directors, and cast members
          </p>
        </div>

        {/* Input Bar */}
        <div className="relative flex items-center bg-base-800/80 border border-white/10 hover:border-white/20 focus-within:border-cinema-red rounded-2xl px-5 py-4 shadow-2xl backdrop-blur-xl transition-all">
          <Search className="w-6 h-6 text-gray-400 mr-4 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a title, actor, or director (e.g. Interstellar, Breaking Bad, Nolan)..."
            className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none text-base sm:text-lg"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search input"
              className="p-1 rounded-full text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {isFetching && (
            <div className="ml-3 w-4 h-4 border-2 border-cinema-red border-t-transparent rounded-full animate-spin flex-shrink-0" />
          )}
        </div>

        {/* Filter Tabs */}
        {debouncedQuery && (
          <div className="flex items-center justify-center gap-2 mt-6 overflow-x-auto no-scrollbar py-1">
            {[
              { id: "all", label: "All Results", icon: Sparkles },
              { id: "movie", label: "Movies", icon: Film },
              { id: "tv", label: "TV Shows", icon: Tv },
              { id: "person", label: "People & Cast", icon: User },
            ].map((tab) => {
              const Icon = tab.icon;
              const count = countFor(tab.id as typeof activeTab);
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-cinema-red text-white shadow-lg shadow-cinema-red/30"
                      : "bg-base-800 text-gray-300 hover:bg-base-700 hover:text-white border border-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? "bg-white/20 text-white" : "bg-base-700 text-gray-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Results View */}
      {isLoading ? (
        <GridSkeleton count={12} />
      ) : !debouncedQuery ? (
        <div className="text-center py-20 text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium text-gray-300">Start typing to search the universe</p>
          <p className="text-xs text-gray-500 mt-1">Instant search delivers real-time results as you type.</p>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="text-center py-20 bg-base-900/50 rounded-2xl border border-white/5 p-8 max-w-lg mx-auto">
          <Film className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-40" />
          <h3 className="text-lg font-bold text-white mb-1">No Results Found</h3>
          <p className="text-xs text-gray-400">
            We couldn't find any results matching "{debouncedQuery}". Try checking for typos or searching a different term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {filteredResults.map((item) => {
            // Render Person Card differently
            if (item.media_type === "person") {
              const knownForTitles = item.known_for
                ?.map((k) => k.title || k.name)
                .filter(Boolean)
                .slice(0, 2)
                .join(", ");

              return (
                <div
                  key={`person-${item.id}`}
                  className="rounded-xl overflow-hidden bg-base-800 border border-white/5 p-3 flex flex-col items-center text-center shadow-lg group hover:border-white/20 transition-all duration-300 hover:-translate-y-1.5"
                >
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-3 ring-2 ring-white/10 group-hover:ring-cinema-red transition-all shadow-md">
                    <BlurImage
                      path={item.profile_path}
                      alt={item.name || "Actor"}
                      size="w300"
                      aspectRatio="aspect-square"
                      className="rounded-full"
                    />
                  </div>
                  <h4 className="text-sm font-bold text-white truncate w-full group-hover:text-cinema-red transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5 capitalize">
                    {item.known_for_department || "Acting"}
                  </p>
                  {knownForTitles && (
                    <p className="text-[10px] text-gray-500 line-clamp-2 mt-1">
                      Known for: {knownForTitles}
                    </p>
                  )}
                </div>
              );
            }

            // Normal Movie / TV MediaCard
            return (
              <div key={`${item.media_type}-${item.id}`} className="flex justify-center">
                <MediaCard
                  item={item}
                  onPlayTrailer={(i) =>
                    setModalVideo({
                      isOpen: true,
                      title: i.title || i.name || "Trailer",
                    })
                  }
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Video Modal */}
      <VideoModal
        isOpen={modalVideo.isOpen}
        onClose={() => setModalVideo((prev) => ({ ...prev, isOpen: false }))}
        title={modalVideo.title}
        videos={modalVideo.videos}
      />
    </div>
  );
};
