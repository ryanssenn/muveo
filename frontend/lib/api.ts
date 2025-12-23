const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface UploadResponse {
  job_id: string;
}

export interface JobStatus {
  status: 'processing' | 'done' | 'failed';
  error?: string;
  metadata?: SongMetadata;
}

export interface SongMetadata {
  description?: string;
  tags?: string;
  lyrics?: string;
  audio_url?: string;
}

export interface SunoImportResponse {
  job_id: string;
  metadata: SongMetadata;
}

export async function uploadAudio(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload audio file');
  }

  return response.json();
}

export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const response = await fetch(`${API_BASE_URL}/status/${jobId}`);

  if (!response.ok) {
    throw new Error('Failed to get job status');
  }

  return response.json();
}

export function getDownloadUrl(jobId: string): string {
  return `${API_BASE_URL}/download/${jobId}`;
}

export async function importSunoUrl(url: string): Promise<SunoImportResponse> {
  const response = await fetch(`${API_BASE_URL}/suno/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to import Suno song');
  }

  return response.json();
}
