# YohPal Live AI Content Factory
YohPal Live AI Content Factory is the seed video generation engine for YohPal Live.
It solves the cold-start problem by generating, scoring, moderating, publishing, and ranking AI-assisted short
videos before the platform has enough human creators.
## Core Flow
1. Trend is discovered.
2. AI script is generated.
3. Viral score is calculated.
4. Video render job is created.
5. Avatar/TTS/video rendering runs.
6. Moderation approves or blocks the video.
7. Approved video is published.
8. Recommendation engine ranks it into user feeds.
9. Feed events improve future generation.
## Main Modules
- API Gateway
- Trend Service
- Script Service
- Render Service
- Moderation Service
- Recommendation Service
- Prisma Database
- Kafka Event Contracts
- Flutter Mobile Feed
- Admin Web Dashboard
## Local Setup
```bash
cp .env.example .env
npm install
docker compose -f infra/docker-compose.yml up -d
npx prisma generate
npx prisma migrate dev --name init
npm run seed