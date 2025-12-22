# Muveo

Muveo is a full-stack application designed to map audio features to generative models to create music videos. You can drop an MP3 or the link to a Suno track, select specific time ranges using an interactive waveform, and process them to generate an MP4.


# Roadmap

App

- [x] fastapi endpoints and async job
- [x] nextjs frontend
- [x] suno scraper

Video generation
- [ ] music visualizer
- [ ] prompting from lyrics to generate scene images, then animating them via a video diffusion model
- [ ] exploring  


A

       ┌─────────────────┐
       │      NGINX      │
       └────┬───────┬────┘
            │       │
        (/) │       │ (/api/backend)
            ▼       ▼
     ┌──────────┐  ┌──────────┐
     │ Next.js  │  │ FastAPI  │
     │ Frontend │  │ Backend  │
     └──────────┘  └────┬─────┘
                        │
                    (async task)
                        │
                        ▼
                 ┌──────────────┐
                 │  Worker Job  │──┐
                 └──────┬───────┘  │
                        │          │ (Write)
                        ▼          │
                 ┌──────────────┐  │
                 │  Local Disk  │◄─┘
                 │  (/tmp/*.mp4)│
                 └──────────────┘


