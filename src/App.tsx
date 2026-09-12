// src/App.tsx
import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { CommandPalette } from "./components/CommandPalette";
import { ApiKeyModal } from "./components/ApiKeyModal";
import { HomePage } from "./pages/HomePage";
import { BrowsePage } from "./pages/BrowsePage";
import { SearchPage } from "./pages/SearchPage";
import { DetailPage } from "./pages/DetailPage";
import { WatchlistPage } from "./pages/WatchlistPage";
import { getConfiguration, setCachedImageBase } from "./services/tmdb";

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export const App: React.FC = () => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Initialize TMDB configuration once on app load
  useEffect(() => {
    getConfiguration()
      .then((config) => {
        if (config?.images?.secure_base_url) {
          setCachedImageBase(config.images.secure_base_url);
        } else if (config?.images?.base_url) {
          setCachedImageBase(config.images.base_url);
        }
      })
      .catch((err) => {
        console.warn("[App] Failed to load TMDB configuration, using default CDN base.", err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-base text-gray-100 flex flex-col font-sans selection:bg-cinema-red selection:text-white">
      <ScrollToTop />

      {/* Global Navbar */}
      <Navbar
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      {/* Main Content Pages */}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/movie/:id" element={<DetailPage type="movie" />} />
          <Route path="/tv/:id" element={<DetailPage type="tv" />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
        </Routes>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 py-8 px-4 sm:px-8 text-center text-xs text-gray-500 bg-base-900/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            StreamVerse is for personal, non-commercial use only. Powered by{" "}
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-white underline"
            >
              TMDB
            </a>
            .
          </p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="hover:text-cinema-red transition-colors"
            >
              API Key Setup
            </button>
            <span>•</span>
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hover:text-white transition-colors"
            >
              Command Palette (Ctrl+K)
            </button>
          </div>
        </div>
      </footer>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      {/* Global API Key Configuration Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </div>
  );
};
