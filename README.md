# YohPal Live AI Content Factory

YohPal Live AI Content Factory is the seed video generation engine for YohPal Live.

It solves the cold-start problem by generating, scoring, moderating, publishing, and ranking AI-assisted short videos before the platform has enough human creators.

## System Flow

1. Trend is discovered.
2. AI script is generated.
3. Viral score is calculated.
4. Video render job is created.
5. Avatar/TTS/video rendering runs.
6. Moderation approves, limits, reviews, or blocks.
7. Approved video is published.
8. Recommendation engine ranks the video into user feeds.
9. Feed events improve future recommendations.

## Prerequisites

- Node.js 20+
- Docker Desktop (optional)
- PostgreSQL client (optional)
- Flutter 3.24+
- npm
- Git

## First-Time Setup

```bash
cp .env.example .env
npm install
docker compose -f infra/docker-compose.yml up --build