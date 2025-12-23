from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import uuid
import os
import urllib.request

from video_gen import generate_mp4
from scrape import get_suno_song

app = FastAPI()

# Add CORS middleware
# When behind NGINX, all requests come from the same origin, so CORS is less restrictive
# For direct development access, localhost origins are allowed
# For production behind NGINX, allow all origins since NGINX handles routing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins - NGINX handles security in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

jobs = {}


class SunoImportRequest(BaseModel):
    url: str


async def process_job(job_id: str, mp3_path: str, video_path: str):
    try:
        await asyncio.to_thread(generate_mp4, mp3_path, video_path)
        jobs[job_id]["status"] = "done"
    except Exception as e:
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)
    finally:
        os.remove(mp3_path)


@app.post("/upload")
async def upload(file: UploadFile):
    job_id = str(uuid.uuid4())
    mp3_path = f"/tmp/{job_id}.mp3"
    video_path = f"/tmp/{job_id}.mp4"

    with open(mp3_path, "wb") as f:
        f.write(await file.read())

    jobs[job_id] = {"status": "processing", "video_path": video_path}
    asyncio.create_task(process_job(job_id, mp3_path, video_path))

    return {"job_id": job_id}


@app.post("/suno/import")
async def import_suno(request: SunoImportRequest):
    """Import a song from Suno by URL. Scrapes metadata and downloads audio."""
    # Validate URL format
    if "suno.com/song/" not in request.url:
        raise HTTPException(400, "Invalid Suno URL. Must be a suno.com/song/ URL")
    
    try:
        # Scrape the song data
        song = get_suno_song(request.url)
        if not song or not song.audio_url:
            raise HTTPException(404, "Could not find song data. The URL may be invalid or the song may be private.")
        
        # Generate job ID and paths
        job_id = str(uuid.uuid4())
        mp3_path = f"/tmp/{job_id}.mp3"
        video_path = f"/tmp/{job_id}.mp4"
        
        # Download the audio file
        await asyncio.to_thread(urllib.request.urlretrieve, song.audio_url, mp3_path)
        
        # Store job with metadata
        jobs[job_id] = {
            "status": "processing",
            "video_path": video_path,
            "metadata": {
                "description": song.description,
                "tags": song.tags,
                "lyrics": song.lyrics,
                "audio_url": song.audio_url,
                "source_url": request.url,
            }
        }
        
        # Start async video generation
        asyncio.create_task(process_job(job_id, mp3_path, video_path))
        
        return {
            "job_id": job_id,
            "metadata": {
                "description": song.description,
                "tags": song.tags,
                "lyrics": song.lyrics,
                "audio_url": song.audio_url,
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Failed to import song: {str(e)}")


@app.get("/status/{job_id}")
def status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(404)
    return {
        "status": jobs[job_id]["status"],
        "error": jobs[job_id].get("error"),
        "metadata": jobs[job_id].get("metadata"),
    }


@app.get("/download/{job_id}")
def download(job_id: str):
    if job_id not in jobs:
        raise HTTPException(404)
    if jobs[job_id]["status"] != "done":
        raise HTTPException(409, "not ready")
    return FileResponse(jobs[job_id]["video_path"], filename="video.mp4")