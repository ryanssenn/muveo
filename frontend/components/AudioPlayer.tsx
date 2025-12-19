'use client';

import { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioWaveform } from "./AudioWaveform";
import type { JobStatus } from "@/lib/api";

interface AudioPlayerProps {
  file: File;
  onGenerate: (startTime: number, endTime: number) => void;
  isGenerating: boolean;
  jobStatus?: JobStatus;
  onDownload?: () => void;
}

export function AudioPlayer({ file, onGenerate, isGenerating, jobStatus, onDownload }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      const dur = audioRef.current.duration;
      setDuration(dur);
      setEndTime(dur);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);
      
      if (time >= endTime) {
        audioRef.current.pause();
        audioRef.current.currentTime = startTime;
        setIsPlaying(false);
      }
    }
  }, [endTime, startTime]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (audioRef.current.currentTime < startTime || audioRef.current.currentTime >= endTime) {
        audioRef.current.currentTime = startTime;
      }
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, startTime, endTime]);

  const resetPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = startTime;
      setCurrentTime(startTime);
      setIsPlaying(false);
    }
  }, [startTime]);

  const handleStartChange = useCallback((value: number) => {
    setStartTime(Math.max(0, value));
    if (audioRef.current && audioRef.current.currentTime < value) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  }, []);

  const handleEndChange = useCallback((value: number) => {
    setEndTime(Math.min(duration, value));
  }, [duration]);

  const isReady = jobStatus?.status === 'done';
  const hasFailed = jobStatus?.status === 'failed';

  return (
    <div className="space-y-6">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Waveform with integrated sliders */}
      {duration > 0 && (
        <div className="glass rounded-xl p-6">
          <AudioWaveform
            audioUrl={audioUrl}
            startTime={startTime}
            endTime={endTime}
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            onStartChange={handleStartChange}
            onEndChange={handleEndChange}
          />
        </div>
      )}

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="secondary"
          size="icon"
          onClick={resetPlayback}
          className="h-12 w-12 rounded-full"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
        
        <Button
          variant="default"
          size="icon"
          onClick={togglePlay}
          className="h-16 w-16 rounded-full glow-primary"
        >
          {isPlaying ? (
            <Pause className="h-7 w-7" />
          ) : (
            <Play className="h-7 w-7 ml-1" />
          )}
        </Button>

        <div className="w-12" />
      </div>

      {/* Status Messages */}
      {isGenerating && (
        <div className="text-center text-muted-foreground">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
          Generating video...
        </div>
      )}

      {hasFailed && (
        <div className="text-center text-destructive">
          Generation failed: {jobStatus.error || "Unknown error"}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        {!isReady && (
          <Button
            onClick={() => onGenerate(startTime, endTime)}
            disabled={isGenerating || duration === 0}
            className="flex-1 h-14 text-lg font-semibold rounded-xl bg-gradient-primary hover:opacity-90 transition-opacity glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <span className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Generating Video...
              </span>
            ) : (
              "Generate Video"
            )}
          </Button>
        )}

        {isReady && onDownload && (
          <Button
            onClick={onDownload}
            className="flex-1 h-14 text-lg font-semibold rounded-xl bg-gradient-primary hover:opacity-90 transition-opacity glow-primary"
          >
            <Download className="mr-2 h-5 w-5" />
            Download Video
          </Button>
        )}
      </div>
    </div>
  );
}

