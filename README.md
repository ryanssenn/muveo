# Muveo

Muveo is a full-stack app that turns audio into visuals, giving Suno artists a way to create visuals without manual editing.


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


