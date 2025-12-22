# Muveo Frontend-Backend Integration

This document describes the integration between the Next.js frontend and FastAPI backend.

## Architecture

### Development (Direct Access)
```
┌─────────────────┐         HTTP/REST         ┌─────────────────┐
│  Next.js        │  ──────────────────────> │  FastAPI        │
│  Frontend       │  <──────────────────────  │  Backend        │
│  (Port 3000)    │                           │  (Port 8000)    │
└─────────────────┘                           ┌─────────────────┘
                                              │
                                              │ Async Processing
                                              ▼
                                         ┌─────────────┐
                                         │  Video Gen  │
                                         │  (stub)     │
                                         └─────────────┘
```

### Production (NGINX Reverse Proxy)
```
┌─────────┐
│ Browser │
└────┬────┘
     │
     ▼
┌─────────────────┐
│  NGINX          │  (Port 80)
│  Reverse Proxy  │
└────┬────────┬───┘
     │        │
     │        └──────────────┐
     │                       │
     ▼                       ▼
┌─────────────┐      ┌─────────────┐
│  Next.js    │      │  FastAPI    │
│  Frontend   │      │  Backend    │
│  (3000)     │      │  (8000)     │
└─────────────┘      └──────┬──────┘
                            │
                            ▼
                      ┌─────────────┐
                      │  Video Gen  │
                      │  (stub)     │
                      └─────────────┘
```

For production deployment with NGINX, see [DEPLOYMENT.md](../../DEPLOYMENT.md).

## API Endpoints

### 1. Upload Audio (`POST /upload`)
- **Request**: Multipart form data with audio file
- **Response**: `{ "job_id": "uuid" }`
- **Usage**: Uploads MP3 file and starts async processing

### 2. Check Status (`GET /status/{job_id}`)
- **Response**: `{ "status": "processing" | "done" | "failed", "error"?: string }`
- **Usage**: Polls job status (frontend polls every 2 seconds when processing)

### 3. Download Video (`GET /download/{job_id}`)
- **Response**: Video file (MP4)
- **Usage**: Downloads completed video

## Frontend Workflow

1. **Upload**: User selects/drops audio file → `uploadAudio()` → Backend returns `job_id`
2. **Processing**: Frontend polls `/status/{job_id}` every 2 seconds using React Query
3. **Completion**: When status is "done", show download button
4. **Download**: User clicks download → Opens download URL in new tab

## Setup Instructions

### Backend
```bash
cd backend
# Install dependencies (if needed)
pip install fastapi uvicorn python-multipart
# Run server
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Environment Variables

### Frontend (.env.local)

**For development (direct access):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**For production (behind NGINX):**
No environment variable needed. The frontend uses relative URLs (`/api/backend`) which NGINX routes to the backend.

## CORS Configuration

The backend includes CORS middleware configured to allow all origins:
- **Development**: Direct access from `http://localhost:3000` works
- **Production**: When behind NGINX, all requests come from the same origin, so CORS is less restrictive. NGINX handles security and routing.

## Current Status

✅ Frontend structure complete
✅ API integration complete
✅ Job status polling implemented
✅ Download functionality ready
⚠️ Video generation is a stub (needs implementation in `video_gen.py`)

## Next Steps

1. Implement actual video generation in `backend/video_gen.py`
2. Add error handling for edge cases
3. Add video preview before download
4. Consider adding progress percentage if possible
5. Add cleanup for old jobs/files

