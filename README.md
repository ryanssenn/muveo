# Muveo

Muveo enables Suno artists to create visuals for their music

in progress, hosted on https://23.94.136.239/

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
                 │  Worker Job  │
                 └──────┬───────┘ 
                        │  
                     (Write)   
                        |     
                        ▼          
                 ┌──────────────┐
                 │  Local Disk  │
                 │  (/tmp/*.mp4)│
                 └──────────────┘


