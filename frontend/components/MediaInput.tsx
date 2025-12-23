'use client';

import { useState } from "react";
import { Upload, Link } from "lucide-react";
import { ClientIcon } from "./ClientIcon";
import { DropZone } from "./DropZone";
import { SunoUrlInput } from "./SunoUrlInput";

interface MediaInputProps {
  onFileSelect: (file: File) => void;
  onUrlSubmit?: (url: string) => void;
  hasFile: boolean;
  hasUrl?: boolean;
  fileName?: string;
  url?: string;
  isLoading?: boolean;
}

type InputMode = 'file' | 'url';

export function MediaInput({ 
  onFileSelect, 
  onUrlSubmit,
  hasFile, 
  hasUrl = false,
  fileName, 
  url,
  isLoading = false,
}: MediaInputProps) {
  const [mode, setMode] = useState<InputMode>('file');

  const handleModeChange = (newMode: InputMode) => {
    console.log('Changing mode to:', newMode);
    setMode(newMode);
  };

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex gap-2 p-1 bg-card/50 rounded-xl border border-border/50">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleModeChange('file');
          }}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg
            font-medium text-sm transition-all duration-200 cursor-pointer
            ${mode === 'file'
              ? 'bg-primary/20 text-primary shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }
          `}
        >
          <ClientIcon fallback={<div className="w-4 h-4" aria-hidden="true" />}>
            <Upload className="w-4 h-4" />
          </ClientIcon>
          Upload File
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleModeChange('url');
          }}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg
            font-medium text-sm transition-all duration-200 cursor-pointer
            ${mode === 'url'
              ? 'bg-primary/20 text-primary shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }
          `}
        >
          <ClientIcon fallback={<div className="w-4 h-4" aria-hidden="true" />}>
            <Link className="w-4 h-4" />
          </ClientIcon>
          Suno URL
        </button>
      </div>

      {/* Input Component */}
      <div>
        {mode === 'file' && (
          <DropZone
            key="file-input"
            onFileSelect={onFileSelect}
            hasFile={hasFile}
            fileName={fileName}
          />
        )}
        {mode === 'url' && (
          <SunoUrlInput
            key="url-input"
            onUrlSubmit={onUrlSubmit || (() => {})}
            isLoading={isLoading}
            hasUrl={hasUrl}
            url={url}
          />
        )}
      </div>
      {/* Debug */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground">Mode: {mode}</div>
      )}
    </div>
  );
}

