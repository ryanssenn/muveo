'use client';

import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SunoUrlInputProps {
  onUrlSubmit: (url: string) => void;
  isLoading?: boolean;
  hasUrl?: boolean;
  url?: string;
}

export function SunoUrlInput({ onUrlSubmit, isLoading = false, hasUrl = false, url }: SunoUrlInputProps) {
  const [inputUrl, setInputUrl] = useState(url || "");
  const [error, setError] = useState("");

  const validateUrl = useCallback((urlString: string): boolean => {
    if (!urlString.trim()) {
      setError("Please enter a Suno URL");
      return false;
    }
    
    if (!urlString.includes("suno.com/song/")) {
      setError("Invalid Suno URL. Must be a suno.com/song/ URL");
      return false;
    }

    try {
      new URL(urlString);
      setError("");
      return true;
    } catch {
      setError("Invalid URL format");
      return false;
    }
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedUrl = inputUrl.trim();
      if (validateUrl(trimmedUrl)) {
        onUrlSubmit(trimmedUrl);
      }
    },
    [inputUrl, onUrlSubmit, validateUrl]
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputUrl(e.target.value);
    if (error) setError("");
  }, [error]);

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border-2 border-dashed 
        transition-all duration-300
        ${hasUrl 
          ? "border-primary/50 bg-card" 
          : "border-border hover:border-primary/50 hover:bg-card/50"
        }
      `}
    >
      {/* Animated background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 p-8">
        {hasUrl ? (
          <div className="flex flex-col items-center justify-center text-center gap-2">
            <div className="w-full max-w-md">
              <p className="text-foreground font-medium truncate">{url}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click to paste a different URL
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-full max-w-md space-y-3">
              <input
                type="text"
                value={inputUrl}
                onChange={handleInputChange}
                placeholder="https://suno.com/song/..."
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all text-center"
              />
              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}
              
              <Button
                type="submit"
                disabled={isLoading || !inputUrl.trim()}
                className="w-full h-12 text-lg font-semibold rounded-xl bg-gradient-primary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Importing...
                  </span>
                ) : (
                  "Import"
                )}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

