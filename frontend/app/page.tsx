'use client';

import { useState, useEffect } from "react";
import { DropZone } from "@/components/DropZone";
import { AudioPlayer } from "@/components/AudioPlayer";
import { toast } from "sonner";
import { uploadAudio, getJobStatus, getDownloadUrl } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  // Poll job status if we have a jobId
  const { data: jobStatus } = useQuery({
    queryKey: ['jobStatus', jobId],
    queryFn: () => jobId ? getJobStatus(jobId) : null,
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data as { status: string } | undefined;
      return data?.status === 'processing' ? 2000 : false;
    },
  });

  // Show toast when job completes
  useEffect(() => {
    if (jobStatus?.status === 'done') {
      toast.success("Video ready!", {
        description: "Your video has been generated successfully",
      });
    } else if (jobStatus?.status === 'failed') {
      toast.error("Generation failed", {
        description: jobStatus.error || "Please try again later",
      });
    }
  }, [jobStatus]);

  const handleFileSelect = (file: File) => {
    setAudioFile(file);
    setJobId(null); // Reset job when new file is selected
    toast.success("Audio file loaded", {
      description: file.name,
    });
  };

  const handleGenerate = async (startTime: number, endTime: number) => {
    if (!audioFile) return;

    try {
      toast.loading("Uploading audio...", { id: 'upload' });
      const response = await uploadAudio(audioFile);
      setJobId(response.job_id);
      toast.success("Video generation started!", {
        id: 'upload',
        description: `Processing ${(endTime - startTime).toFixed(1)} seconds of audio`,
      });
    } catch (error) {
      toast.error("Upload failed", {
        id: 'upload',
        description: "Please try again later",
      });
    }
  };

  const handleDownload = () => {
    if (jobId && jobStatus?.status === 'done') {
      window.open(getDownloadUrl(jobId), '_blank');
    }
  };

  const isGenerating = jobStatus?.status === 'processing';
  const isReady = jobStatus?.status === 'done';

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 container max-w-2xl mx-auto py-4 px-4">
        {/* Header */}
        <header className="text-center mb-4">
          <div className="mb-2">
            <span className="text-7xl md:text-8xl font-bold tracking-tight animated-blue-gradient">
              muveo
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            Transform Sound Into<br />
            <span className="gradient-text">Vision</span>
          </h1>
        </header>

        {/* Main Content */}
        <main className="space-y-3">
          <DropZone 
            onFileSelect={handleFileSelect}
            hasFile={!!audioFile}
            fileName={audioFile?.name}
          />

          {audioFile && (
            <AudioPlayer
              file={audioFile}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              jobStatus={jobStatus}
              onDownload={isReady ? handleDownload : undefined}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Supported formats: MP3, WAV, M4A, OGG
          </p>
        </footer>
      </div>
    </div>
  );
}

