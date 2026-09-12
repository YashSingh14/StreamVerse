// src/components/FilterSidebar.tsx
import React, { useState } from "react";
import { Filter, RotateCcw, X, Search, ChevronDown, Check } from "lucide-react";
import type { Genre, Language } from "../services/types";

export interface FilterState {
  mediaType: "movie" | "tv";
  selectedGenres: number[];
  language: string;
  yearMin: number;
  yearMax: number;
  minRating: number;
  sortBy:
    | "popularity.desc"
    | "vote_average.desc"
    | "primary_release_date.desc"
    | "revenue.desc";
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
  genres: Genre[];
  languages: Language[];
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onChange,
  onReset,
  genres = [],
  languages = [],
  isOpenMobile,
  onCloseMobile,
}) => {
  const [langSearch, setLangSearch] = useState("");
  const [isLangOpen, setIsLangOpen] = useState(false);

  const currentYear = new Date().getFullYear();

  const handleGenreToggle = (id: number) => {
    const updated = filters.selectedGenres.includes(id)
      ? filters.selectedGenres.filter((g) => g !== id)
      : [...filters.selectedGenres, id];
    onChange({ ...filters, selectedGenres: updated });
  };

  const filteredLanguages = languages
    .filter(
      (l) =>
        l.english_name.toLowerCase().includes(langSearch.toLowerCase()) ||
        l.name.toLowerCase().includes(langSearch.toLowerCase())
    )
    .slice(0, 40);

  const selectedLangName =
    languages.find((l) => l.iso_639_1 === filters.language)?.english_name ||
    (filters.language === "" ? "All Languages" : filters.language);

  const content = (
    <div className="space-y-6 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-cinema-red" />
          <h3 className="font-bold text-white text-base">Filters</h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center space-x-1 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Media Type Toggle */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
          Media Type
        </label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-base-800 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => onChange({ ...filters, mediaType: "movie" })}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              filters.mediaType === "movie"
                ? "bg-cinema-red text-white shadow-md shadow-cinema-red/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Movies
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...filters, mediaType: "tv" })}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              filters.mediaType === "tv"
                ? "bg-cinema-red text-white shadow-md shadow-cinema-red/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            TV Shows
          </button>
        </div>
      </div>

      {/* Sort By Dropdown */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
          Sort By
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) =>
            onChange({
              ...filters,
              sortBy: e.target.value as FilterState["sortBy"],
            })
          }
          className="w-full bg-base-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cinema-red"
        >
          <option value="popularity.desc">Most Popular</option>
          <option value="vote_average.desc">Highest Rated</option>
          <option value="primary_release_date.desc">Release Date (Newest)</option>
          <option value="revenue.desc">Highest Box Office Revenue</option>
        </select>
      </div>

      {/* Original Language Searchable Dropdown */}
      <div className="relative">
        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
          Original Language
        </label>
        <button
          type="button"
          onClick={() => setIsLangOpen(!isLangOpen)}
          className="w-full flex items-center justify-between bg-base-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
        >
          <span className="truncate">{selectedLangName}</span>
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
        </button>

        {isLangOpen && (
          <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-base-900 border border-white/10 rounded-xl shadow-2xl p-2 space-y-2">
            <div className="flex items-center px-2 py-1.5 bg-base-800 rounded-lg border border-white/5">
              <Search className="w-3.5 h-3.5 text-gray-400 mr-2" />
              <input
                type="text"
                value={langSearch}
                onChange={(e) => setLangSearch(e.target.value)}
                placeholder="Search languages..."
                className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              <button
                type="button"
                onClick={() => {
                  onChange({ ...filters, language: "" });
                  setIsLangOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  filters.language === ""
                    ? "bg-cinema-red text-white"
                    : "text-gray-300 hover:bg-white/10"
                }`}
              >
                <span>All Languages</span>
                {filters.language === "" && <Check className="w-3.5 h-3.5" />}
              </button>
              {filteredLanguages.map((l) => (
                <button
                  key={l.iso_639_1}
                  type="button"
                  onClick={() => {
                    onChange({ ...filters, language: l.iso_639_1 });
                    setIsLangOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    filters.language === l.iso_639_1
                      ? "bg-cinema-red text-white"
                      : "text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <span>{l.english_name}</span>
                  {filters.language === l.iso_639_1 && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rating Slider (0 - 10) */}
      <div>
        <div className="flex items-center justify-between text-xs mb-2">
          <label className="font-semibold text-gray-300 uppercase tracking-wider">
            Minimum Rating
          </label>
          <span className="font-bold text-amber-400">{filters.minRating} / 10</span>
        </div>
        <input
          type="range"
          min="0"
          max="9.5"
          step="0.5"
          value={filters.minRating}
          onChange={(e) =>
            onChange({ ...filters, minRating: parseFloat(e.target.value) })
          }
          className="w-full accent-cinema-red h-1.5 bg-base-700 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-gray-500 mt-1">
          <span>Any</span>
          <span>5.0</span>
          <span>8.0+ (Acclaimed)</span>
        </div>
      </div>

      {/* Release Year Range Dual Inputs */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
          Release Year ({filters.yearMin} – {filters.yearMax})
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-gray-400 block mb-1">From</span>
            <input
              type="number"
              min="1960"
              max={filters.yearMax}
              value={filters.yearMin}
              onChange={(e) =>
                onChange({ ...filters, yearMin: Number(e.target.value) })
              }
              className="w-full bg-base-800 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cinema-red"
            />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block mb-1">To</span>
            <input
              type="number"
              min={filters.yearMin}
              max={currentYear + 2}
              value={filters.yearMax}
              onChange={(e) =>
                onChange({ ...filters, yearMax: Number(e.target.value) })
              }
              className="w-full bg-base-800 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cinema-red"
            />
          </div>
        </div>
      </div>

      {/* Genres Multi-select Chips */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
          Genres ({filters.selectedGenres.length} selected)
        </label>
        <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
          {genres.map((genre) => {
            const isSelected = filters.selectedGenres.includes(genre.id);
            return (
              <button
                key={genre.id}
                type="button"
                onClick={() => handleGenreToggle(genre.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-cinema-red text-white shadow-md shadow-cinema-red/20 font-semibold"
                    : "bg-base-800 text-gray-300 hover:bg-base-700 hover:text-white border border-white/5"
                }`}
              >
                {genre.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-24 h-[calc(100vh-7rem)] overflow-y-auto pr-4 pb-10">
        <div className="bg-base-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
          {content}
        </div>
      </aside>

      {/* Mobile Drawer Modal */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-full max-w-xs bg-base-900 h-full p-6 overflow-y-auto border-l border-white/10 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={onCloseMobile}
                  className="p-1 rounded-full text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {content}
            </div>
            <div className="pt-6 border-t border-white/10 mt-6">
              <button
                onClick={onCloseMobile}
                className="w-full py-3 rounded-xl bg-cinema-red text-white font-semibold text-sm shadow-lg shadow-cinema-red/30"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
