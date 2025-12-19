'use client';

import { useCallback, useState } from "react";
import { Music, Upload } from "lucide-react";
import { ClientIcon } from "./ClientIcon";

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  hasFile: boolean;
  fileName?: string;
}

export function DropZone({ onFileSelect, hasFile, fileName }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.includes("audio")) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative overflow-hidden rounded-2xl border-2 border-dashed 
        transition-all duration-300 cursor-pointer group
        ${isDragOver 
          ? "border-primary bg-primary/10 scale-[1.02]" 
          : hasFile 
            ? "border-primary/50 bg-card" 
            : "border-border hover:border-primary/50 hover:bg-card/50"
        }
      `}
    >
      <label className="flex flex-col items-center justify-center p-12 cursor-pointer">
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileInput}
          className="hidden"
        />
        
        {/* Animated background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
          {isDragOver && (
            <div className="absolute inset-0 animate-pulse bg-primary/10" />
          )}
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className={`
            p-4 rounded-full transition-all duration-300
            ${hasFile 
              ? "bg-primary/20 text-primary" 
              : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
            }
          `}>
            <ClientIcon fallback={<div className="w-8 h-8" aria-hidden="true" />}>
              {hasFile ? (
                <Music className="w-8 h-8" />
              ) : (
                <Upload className="w-8 h-8" />
              )}
            </ClientIcon>
          </div>
          
          {hasFile ? (
            <div className="text-center">
              <p className="text-foreground font-medium">{fileName}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click or drop to replace
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-foreground font-medium">
                Drop your MP3 here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse
              </p>
            </div>
          )}
        </div>
      </label>
    </div>
  );
}

