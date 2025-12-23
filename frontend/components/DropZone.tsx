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
        relative overflow-hidden rounded-3xl border border-dashed
        transition-all duration-300 cursor-pointer group
        ${isDragOver 
          ? "border-primary bg-primary/10 scale-[1.01]" 
          : hasFile 
            ? "border-primary/40 bg-card" 
            : "border-border/70 bg-card/60 hover:border-primary/40 hover:bg-card/80"
        }
      `}
    >
      <label className="flex flex-col items-center justify-center px-8 py-10 md:px-12 md:py-12 cursor-pointer">
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileInput}
          className="hidden"
        />
        
        {/* Soft, organic background */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background/70 to-accent/10" />
          <div className="absolute inset-4 rounded-[2rem] opacity-50 dropzone-texture" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className={`
            p-4 rounded-2xl transition-all duration-300 shadow-sm
            ${hasFile 
              ? "bg-primary/18 text-primary"
              : "bg-muted/80 text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary"
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
              <p className="text-foreground font-medium tracking-tight">{fileName}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click or drop another moment to replace it
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-foreground font-medium tracking-tight">
                Drop your song here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse from your library
              </p>
            </div>
          )}
        </div>
      </label>
    </div>
  );
}

