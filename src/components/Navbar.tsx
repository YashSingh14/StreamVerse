// src/components/Navbar.tsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Bookmark, Compass, Home, Key, Sparkles, Command } from "lucide-react";
import { useWatchlistStore } from "../store/watchlistStore";
import { hasApiToken } from "../services/tmdb";

interface NavbarProps {
  onOpenCommandPalette: () => void;
  onOpenApiKeyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCommandPalette,
  onOpenApiKeyModal,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const { watchlist, favorites } = useWatchlistStore();
  const totalSaved = watchlist.length + favorites.length;
  const isKeySet = hasApiToken();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Browse", path: "/browse", icon: Compass },
    { name: "Search", path: "/search", icon: Search },
    { name: "My List", path: "/watchlist", icon: Bookmark, badge: totalSaved },
  ];

  return (
    <>
      {/* Desktop & Tablet Top Sticky Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "glass-nav shadow-lg shadow-black/50 py-3"
            : "bg-gradient-to-b from-base-900/90 via-base-900/40 to-transparent py-4 sm:py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          {/* Logo + Navigation Links */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cinema-red to-rose-500 flex items-center justify-center shadow-lg shadow-cinema-red/30 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center">
                STREAM<span className="text-cinema-red">VERSE</span>
              </span>
            </Link>

            {/* Desktop Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "text-white bg-white/10"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span>{link.name}</span>
                    {link.badge !== undefined && link.badge > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-cinema-red text-white font-bold">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Command Palette Button */}
            <button
              onClick={onOpenCommandPalette}
              aria-label="Open search command palette"
              className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-base-800/80 hover:bg-base-700/80 border border-white/10 text-gray-300 hover:text-white text-xs transition-all shadow-inner"
            >
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <span>Search...</span>
              <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-base-700 rounded text-gray-400 border border-white/5">
                <Command className="w-2.5 h-2.5" /> K
              </kbd>
            </button>

            {/* Search Icon for mobile */}
            <button
              onClick={() => navigate("/search")}
              aria-label="Search"
              className="sm:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* TMDB API Key Status / Config Button */}
            <button
              onClick={onOpenApiKeyModal}
              aria-label="TMDB API Configuration"
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                isKeySet
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50"
                  : "bg-cinema-red/10 border-cinema-red/40 text-cinema-red hover:bg-cinema-red/20 animate-pulse"
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{isKeySet ? "TMDB Connected" : "API Setup"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-base-900/95 backdrop-blur-xl border-t border-white/10 px-4 py-2 flex items-center justify-around shadow-2xl">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors relative ${
                isActive ? "text-cinema-red font-bold" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span>{link.name}</span>
              {link.badge !== undefined && link.badge > 0 && (
                <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-cinema-red text-white text-[9px] flex items-center justify-center font-bold">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
};
