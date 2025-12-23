'use client';

import { useState, useEffect } from "react";
import { MediaInput } from "@/components/MediaInput";
import { AudioPlayer } from "@/components/AudioPlayer";
import { SongMetadata as SongMetadataComponent } from "@/components/SongMetadata";
import { toast } from "sonner";
import { uploadAudio, getJobStatus, getDownloadUrl, importSunoUrl } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { SongMetadata } from "@/lib/api";

export default function Home() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [sunoUrl, setSunoUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<SongMetadata | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [isImportingSuno, setIsImportingSuno] = useState(false);

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

  // Update metadata from job status if available
  useEffect(() => {
    if (jobStatus?.metadata && !metadata) {
      setMetadata(jobStatus.metadata);
      if (jobStatus.metadata.audio_url && !audioUrl) {
        setAudioUrl(jobStatus.metadata.audio_url);
      }
    }
  }, [jobStatus, metadata, audioUrl]);

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
    setAudioUrl(null);
    setSunoUrl(null);
    setMetadata(null);
    setJobId(null); // Reset job when new file is selected
    toast.success("Audio file loaded", {
      description: file.name,
    });
  };

  const handleSunoUrlSubmit = async (url: string) => {
    setIsImportingSuno(true);
    try {
      toast.loading("Importing from Suno...", { id: 'suno-import' });
      const response = await importSunoUrl(url);
      
      setSunoUrl(url);
      setMetadata(response.metadata);
      setJobId(response.job_id);
      setAudioFile(null);
      
      // If we have an audio URL from Suno, use it for playback
      if (response.metadata.audio_url) {
        setAudioUrl(response.metadata.audio_url);
      }
      
      toast.success("Song imported!", {
        id: 'suno-import',
        description: "Video generation started",
      });
    } catch (error) {
      toast.error("Import failed", {
        id: 'suno-import',
        description: error instanceof Error ? error.message : "Please check the URL and try again",
      });
    } finally {
      setIsImportingSuno(false);
    }
  };

  const handleGenerate = async (startTime: number, endTime: number) => {
    // If we already have a job from Suno import, don't upload again
    if (jobId && sunoUrl) {
      toast.info("Video generation already in progress", {
        description: "This song is being processed from Suno",
      });
      return;
    }

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
  const hasAudio = audioFile || audioUrl;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background: warm gradient with subtle texture */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="absolute -top-32 left-10 w-72 h-72 bg-amber-300/10 rounded-[40%] blur-3xl mix-blend-soft-light animate-float-soft" />
        <div className="absolute -bottom-40 right-0 w-80 h-80 bg-rose-300/10 rounded-[45%] blur-3xl mix-blend-soft-light animate-float-soft" />
        <div className="absolute inset-0 opacity-[0.14] mix-blend-soft-light hero-texture" />
      </div>

      <div className="relative z-10 container max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <header className="mb-8 flex flex-col items-center text-center gap-3">
          <div className="mb-1">
            <span className="text-[3rem] md:text-[3.5rem] font-semibold tracking-tight brand-wordmark">
              muveo
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold leading-tight tracking-tight">
            Make it <span className="gradient-text">look</span> how it <span className="gradient-text">feels</span>
          </h1>
          <p className="max-w-xl text-sm md:text-base text-muted-foreground">
            Pick the moment that feels right and turn it into a video.
          </p>
        </header>

        {/* Main Content */}
        <main className="space-y-4">
          <MediaInput
            onFileSelect={handleFileSelect}
            onUrlSubmit={handleSunoUrlSubmit}
            hasFile={!!audioFile}
            hasUrl={!!sunoUrl}
            fileName={audioFile?.name}
            url={sunoUrl || undefined}
            isLoading={isImportingSuno}
          />

          {/* Song Metadata */}
          {metadata && <SongMetadataComponent metadata={metadata} />}

          {hasAudio && (
            <AudioPlayer
              file={audioFile || undefined}
              audioUrl={audioUrl || undefined}
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
            Upload an audio file or paste a Suno URL to begin.
            We’ll handle the details so you can stay with the music.
          </p>
        </footer>
      </div>
    </div>
  );
}

