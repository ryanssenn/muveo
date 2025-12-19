from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import uuid
import os

from video_gen import generate_mp4

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

jobs = {}


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


@app.get("/status/{job_id}")
def status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(404)
    return {"status": jobs[job_id]["status"], "error": jobs[job_id].get("error")}


@app.get("/download/{job_id}")
def download(job_id: str):
    if job_id not in jobs:
        raise HTTPException(404)
    if jobs[job_id]["status"] != "done":
        raise HTTPException(409, "not ready")
    return FileResponse(jobs[job_id]["video_path"], filename="video.mp4")