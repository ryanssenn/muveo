'use client';

import { useState } from "react";
import { ChevronDown, ChevronUp, Music, Tag, FileText } from "lucide-react";
import { ClientIcon } from "./ClientIcon";
import type { SongMetadata as SongMetadataType } from "@/lib/api";

interface SongMetadataProps {
  metadata: SongMetadataType;
}

export function SongMetadata({ metadata }: SongMetadataProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!metadata.description && !metadata.tags && !metadata.lyrics) {
    return null;
  }

  return (
    <div className="glass rounded-xl p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-2">
          <ClientIcon fallback={<div className="w-4 h-4" aria-hidden="true" />}>
            <Music className="w-4 h-4 text-primary" />
          </ClientIcon>
          <span className="font-semibold text-foreground">Song Information</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
            From Suno
          </span>
        </div>
        <ClientIcon fallback={<div className="w-4 h-4" aria-hidden="true" />}>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          )}
        </ClientIcon>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4 pt-4 border-t border-border/50">
          {metadata.description && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ClientIcon fallback={<div className="w-4 h-4" aria-hidden="true" />}>
                  <FileText className="w-4 h-4 text-primary/70" />
                </ClientIcon>
                <h4 className="text-sm font-semibold text-foreground">Description</h4>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {metadata.description}
              </p>
            </div>
          )}

          {metadata.tags && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ClientIcon fallback={<div className="w-4 h-4" aria-hidden="true" />}>
                  <Tag className="w-4 h-4 text-primary/70" />
                </ClientIcon>
                <h4 className="text-sm font-semibold text-foreground">Tags</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {metadata.tags}
              </p>
            </div>
          )}

          {metadata.lyrics && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ClientIcon fallback={<div className="w-4 h-4" aria-hidden="true" />}>
                  <Music className="w-4 h-4 text-primary/70" />
                </ClientIcon>
                <h4 className="text-sm font-semibold text-foreground">Lyrics</h4>
              </div>
              <div className="bg-background/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                  {metadata.lyrics}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

