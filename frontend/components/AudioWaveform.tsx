'use client';

import { useEffect, useRef, useState, useCallback } from "react";

interface AudioWaveformProps {
  audioUrl: string;
  startTime: number;
  endTime: number;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onStartChange: (value: number) => void;
  onEndChange: (value: number) => void;
}

export function AudioWaveform({ 
  audioUrl, 
  startTime, 
  endTime, 
  currentTime, 
  duration,
  isPlaying,
  onStartChange,
  onEndChange,
}: AudioWaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [dragging, setDragging] = useState<"start" | "end" | null>(null);

  useEffect(() => {
    if (!audioUrl) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    fetch(audioUrl)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        const rawData = audioBuffer.getChannelData(0);
        const samples = 120;
        const blockSize = Math.floor(rawData.length / samples);
        const filteredData: number[] = [];
        
        for (let i = 0; i < samples; i++) {
          let blockStart = blockSize * i;
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(rawData[blockStart + j]);
          }
          filteredData.push(sum / blockSize);
        }
        
        const multiplier = Math.pow(Math.max(...filteredData), -1);
        setWaveformData(filteredData.map(n => n * multiplier));
      });

    return () => {
      audioContext.close();
    };
  }, [audioUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const barWidth = width / waveformData.length;
    const barGap = 2;

    ctx.clearRect(0, 0, width, height);

    waveformData.forEach((value, index) => {
      const x = index * barWidth;
      const barHeight = value * (height * 0.85);
      const y = (height - barHeight) / 2;
      
      const progress = index / waveformData.length;
      const isInRange = progress >= startTime / duration && progress <= endTime / duration;
      const isPlayed = progress <= currentTime / duration;

      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
      
      if (isInRange) {
        if (isPlayed && isPlaying) {
          gradient.addColorStop(0, "hsl(175, 80%, 55%)");
          gradient.addColorStop(1, "hsl(280, 70%, 65%)");
        } else {
          gradient.addColorStop(0, "hsl(175, 80%, 45%)");
          gradient.addColorStop(1, "hsl(280, 70%, 55%)");
        }
      } else {
        gradient.addColorStop(0, "hsl(220, 15%, 22%)");
        gradient.addColorStop(1, "hsl(220, 15%, 18%)");
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x + barGap / 2, y, barWidth - barGap, barHeight, 2);
      ctx.fill();
    });
  }, [waveformData, startTime, endTime, currentTime, duration, isPlaying]);

  const getTimeFromPosition = useCallback((clientX: number) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    return percentage * duration;
  }, [duration]);

  const handleMouseDown = useCallback((type: "start" | "end") => (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(type);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging) return;
    const time = getTimeFromPosition(e.clientX);
    
    if (dragging === "start") {
      onStartChange(Math.min(time, endTime - 0.5));
    } else {
      onEndChange(Math.max(time, startTime + 0.5));
    }
  }, [dragging, getTimeFromPosition, startTime, endTime, onStartChange, onEndChange]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragging, handleMouseMove, handleMouseUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startPercent = (startTime / duration) * 100;
  const endPercent = (endTime / duration) * 100;

  return (
    <div className="space-y-3">
      <div 
        ref={containerRef}
        className="w-full h-32 relative select-none"
      >
        <canvas 
          ref={canvasRef} 
          className="w-full h-full"
        />
        
        {/* Selection overlay */}
        <div 
          className="absolute top-0 h-full bg-primary/5 pointer-events-none"
          style={{
            left: `${startPercent}%`,
            width: `${endPercent - startPercent}%`,
          }}
        />

        {/* Start handle */}
        <div
          className={`absolute top-0 h-full w-1 cursor-ew-resize group ${dragging === "start" ? "z-20" : "z-10"}`}
          style={{ left: `${startPercent}%`, transform: "translateX(-50%)" }}
          onMouseDown={handleMouseDown("start")}
        >
          <div className={`absolute inset-y-0 w-1 transition-all ${dragging === "start" ? "bg-primary shadow-lg shadow-primary/50" : "bg-primary/70 group-hover:bg-primary"}`} />
          <div className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 w-4 h-10 rounded-md border-2 transition-all flex items-center justify-center ${dragging === "start" ? "bg-primary border-primary scale-110" : "bg-card border-primary/70 group-hover:border-primary group-hover:bg-primary/20"}`}>
            <div className="flex gap-0.5">
              <div className="w-0.5 h-4 bg-primary/60 rounded-full" />
              <div className="w-0.5 h-4 bg-primary/60 rounded-full" />
            </div>
          </div>
          {/* Time tooltip */}
          <div className={`absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-card border border-border text-xs font-mono text-primary transition-opacity ${dragging === "start" ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
            {formatTime(startTime)}
          </div>
        </div>

        {/* End handle */}
        <div
          className={`absolute top-0 h-full w-1 cursor-ew-resize group ${dragging === "end" ? "z-20" : "z-10"}`}
          style={{ left: `${endPercent}%`, transform: "translateX(-50%)" }}
          onMouseDown={handleMouseDown("end")}
        >
          <div className={`absolute inset-y-0 w-1 transition-all ${dragging === "end" ? "bg-accent shadow-lg shadow-accent/50" : "bg-accent/70 group-hover:bg-accent"}`} />
          <div className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 w-4 h-10 rounded-md border-2 transition-all flex items-center justify-center ${dragging === "end" ? "bg-accent border-accent scale-110" : "bg-card border-accent/70 group-hover:border-accent group-hover:bg-accent/20"}`}>
            <div className="flex gap-0.5">
              <div className="w-0.5 h-4 bg-accent/60 rounded-full" />
              <div className="w-0.5 h-4 bg-accent/60 rounded-full" />
            </div>
          </div>
          {/* Time tooltip */}
          <div className={`absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-card border border-border text-xs font-mono text-accent transition-opacity ${dragging === "end" ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
            {formatTime(endTime)}
          </div>
        </div>

        {/* Playhead */}
        {isPlaying && currentTime >= startTime && currentTime <= endTime && (
          <div 
            className="absolute top-0 h-full w-0.5 bg-foreground/80 shadow-lg pointer-events-none z-30"
            style={{
              left: `${(currentTime / duration) * 100}%`,
            }}
          />
        )}
      </div>

      {/* Time display */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-mono text-primary">{formatTime(startTime)}</span>
        <span className="text-muted-foreground">
          Duration: <span className="font-mono text-foreground">{formatTime(endTime - startTime)}</span>
        </span>
        <span className="font-mono text-accent">{formatTime(endTime)}</span>
      </div>
    </div>
  );
}

