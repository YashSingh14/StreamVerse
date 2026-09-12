// src/components/ApiKeyModal.tsx
import React, { useState } from "react";
import { Key, X, ExternalLink, Check, AlertCircle, ShieldCheck } from "lucide-react";
import { getApiToken, setLocalApiToken, hasApiToken } from "../services/tmdb";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [tokenInput, setTokenInput] = useState(getApiToken());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const isKeyActive = hasApiToken();

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalApiToken(tokenInput.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setTokenInput("");
    setLocalApiToken("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg bg-base-900 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cinema-red/10 text-cinema-red border border-cinema-red/20">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">TMDB API Configuration</h3>
              <p className="text-xs text-gray-400">Connect live data from The Movie Database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status pill */}
        <div
          className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-medium border ${
            isKeyActive
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
              : "bg-amber-950/40 border-amber-500/30 text-amber-300"
          }`}
        >
          {isKeyActive ? (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Live TMDB API Connected & Active.</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Preview Mode active. Live token not yet configured.</span>
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-300 bg-base-800/80 p-4 rounded-xl border border-white/5 space-y-2">
          <p className="font-semibold text-white">How to get your API Token:</p>
          <ol className="list-decimal list-inside space-y-1 text-gray-400">
            <li>
              Log in to{" "}
              <a
                href="https://www.themoviedb.org/settings/api"
                target="_blank"
                rel="noreferrer"
                className="text-cinema-red underline inline-flex items-center gap-0.5 hover:text-cinema-hover"
              >
                themoviedb.org/settings/api <ExternalLink className="w-3 h-3 inline" />
              </a>
            </li>
            <li>Submit your personal app details (or your Vercel deployment URL).</li>
            <li>Copy the <strong>API Read Access Token (v4)</strong> (long string).</li>
            <li>Paste it here or put it into your <code className="text-gray-200">.env</code> file.</li>
          </ol>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              API Read Access Token (v4 auth)
            </label>
            <textarea
              rows={3}
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full bg-base-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cinema-red focus:ring-1 focus:ring-cinema-red font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {tokenInput && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-gray-400 hover:text-red-400 transition-colors"
              >
                Clear Token
              </button>
            )}
            <div className="flex items-center space-x-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-cinema-red hover:bg-cinema-hover text-white text-xs font-semibold shadow-lg shadow-cinema-red/30 transition-all active:scale-95"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save & Connect</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
