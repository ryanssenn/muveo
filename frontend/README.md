# Muveo Frontend

Next.js frontend for the Muveo audio-to-video application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set environment variables (optional):
```bash
# Create .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Run the development server:
```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Features

- Audio file upload with drag & drop
- Interactive waveform visualization
- Time range selection for video generation
- Real-time job status polling
- Video download when ready

## Tech Stack

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- shadcn-ui
- TanStack Query (React Query)
- Sonner (Toast notifications)

