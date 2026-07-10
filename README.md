# YohPal Live AI Content Factory

YohPal Live AI Content Factory is the seed video generation engine for **YohPal Live** — a short-form video platform. It solves the cold-start problem by generating, scoring, moderating, publishing, and ranking AI-assisted short videos before the platform has enough human creators.

---

## System Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Trend        │───▶│  AI Script   │───▶│  Viral Score  │
│  Discovery    │    │  Generation  │    │  Calculation  │
└──────────────┘    └──────────────┘    └──────────────┘
                                              │
                                              ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Recommendation│◀──│  Publishing  │◀──│  Render Job   │
│  & Ranking    │    │  (Moderation)│    │  (Avatar/TTS) │
└──────────────┘    └──────────────┘    └──────────────┘
```

1. **Trend Discovery** — Trending topics are identified and seeded.
2. **AI Script Generation** — Scripts are generated using LLM providers.
3. **Viral Score Calculation** — Each script is scored for viral potential.
4. **Video Render Job** — Render jobs are created for approved scripts.
5. **Avatar/TTS/Video Rendering** — Videos are rendered with AI avatars and TTS.
6. **Moderation** — Content passes through safety checks before publishing.
7. **Publishing** — Approved videos are published to the platform.
8. **Recommendation Engine** — Videos are ranked into user feeds.
9. **Feed Events** — User interactions improve future recommendations.

---

## Architecture

### Microservices

| Service | Port | Purpose |
|---|---:|---|
| **API Gateway** | 3000 | Main public API and entry point |
| **Trend Service** | 3001 | Seed trend creation and management |
| **Script Service** | 3002 | AI script generation via LLM providers |
| **Render Service** | 3003 | Video render job orchestration |
| **Moderation Service** | 3004 | Safety checks, approval, and publishing |
| **Recommendation Service** | 3005 | Seed feed ranking and recommendations |
| **Admin Web** | 3100 | Admin dashboard (Next.js) |

### Tech Stack

- **Backend:** NestJS (TypeScript)
- **Database:** PostgreSQL with Prisma ORM
- **Queue:** Redis + BullMQ
- **Message Broker:** Kafka (optional)
- **Mobile:** Flutter
- **Admin Dashboard:** Next.js
- **Infrastructure:** Docker, Kubernetes, Nginx

### Data Models

- `Creator` — Platform creators with trust scores
- `CreatorTwin` — AI twin profiles for creator cloning
- `Avatar` — AI avatar definitions
- `Video` — Video metadata and status tracking
- `Trend` — Discovered trending topics
- `Script` — Generated scripts linked to trends
- `RenderJob` — Video rendering jobs
- `ModerationResult` — Content moderation outcomes
- `FeedRanking` — Recommendation scores

---

## Required Tools

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL client (optional, for direct DB access)
- Flutter 3.24+ (for mobile app)
- npm
- Git

---

## First-Time Setup

```bash
# Clone the repository
git clone https://github.com/isackkibet/video-generetor.git
cd video-generetor

# Copy environment variables
cp .env.example .env

# Install dependencies
npm install

# Start all services with Docker
docker compose -f infra/docker-compose.yml up --build
```

### Manual Setup (without Docker)

```bash
# Copy environment variables
cp .env.example .env

# Update .env with your local PostgreSQL and Redis URLs
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/yohpal_live_ai"
# REDIS_URL="redis://localhost:60379"

# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Seed the database
npx prisma db seed

# Start services individually
npm run start:gateway
npm run start:trend
npm run start:script
npm run start:render
npm run start:moderation
npm run start:recommendation
```

---

## Environment Variables

Key environment variables (see `.env.example` for full list):

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/yohpal_live_ai` |
| `REDIS_URL` | Redis connection string | `redis://localhost:60379` |
| `API_GATEWAY_KEY` | API gateway authentication key | `change-this-api-key` |
| `ADMIN_JWT_SECRET` | JWT secret for admin auth | `change-this-secret` |
| `LLM_PROVIDER` | AI script generation provider | `mock` |
| `TTS_PROVIDER` | Text-to-speech provider | `mock` |
| `AVATAR_PROVIDER` | Avatar rendering provider | `mock` |
| `VIDEO_RENDER_PROVIDER` | Video render provider | `mock` |
| `MODERATION_PROVIDER` | Content moderation provider | `mock` |
| `MODERATION_THRESHOLD` | Minimum score for auto-approval | `0.78` |
| `VIRAL_PUBLISH_THRESHOLD` | Minimum viral score to publish | `0.75` |

---

## Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run end-to-end tests
npm run test:e2e

# Run production readiness tests
npm run test:production-readiness

# Full CI pipeline (typecheck + unit + e2e)
npm run ci
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run typecheck` | TypeScript type checking |
| `npm run ci` | Full CI pipeline |
| `npm run ci:production-readiness` | Production readiness verification |
| `npm run certification:blueprint` | Blueprint certification report |
| `npm run certification:enforce` | Enforce blueprint alignment |
| `npm run certification:go-no-go` | Go/No-Go certification |
| `npm run evidence:full` | Generate full evidence bundle |
| `npm run deployment:verify-lock` | Verify production deployment lock |

---

## Infrastructure

### Docker Compose

```bash
docker compose -f infra/docker-compose.yml up --build -d
```

### Kubernetes

Kubernetes manifests are available in `infra/k8s/`.

### Nginx

Nginx configuration is available in `infra/nginx/`.

---

## Project Structure

```
yohpal-live-ai-content-factory/
├── ai/                    # AI provider integrations
├── apps/
│   ├── admin_web/         # Next.js admin dashboard
│   └── mobile_flutter/    # Flutter mobile app
├── backend/
│   ├── api-gateway/       # API Gateway service
│   ├── trend-service/     # Trend discovery service
│   ├── script-service/    # AI script generation
│   ├── render-service/    # Video rendering service
│   ├── moderation-service/# Content moderation
│   ├── recommendation-service/ # Feed recommendations
│   ├── shared/            # Shared utilities and guards
│   └── diagnostics/       # System diagnostics
├── contracts/             # API contracts
├── infra/                 # Infrastructure (Docker, K8s, Nginx)
├── prisma/                # Database schema and migrations
├── scripts/               # Build and CI scripts
├── tests/                 # Test suites
└── docs/                  # Documentation
```

---

## API Gateway Routes

The API Gateway proxies requests to individual services:

- `POST /api/v1/trends` — Create a new trend
- `POST /api/v1/scripts/generate` — Generate AI script
- `POST /api/v1/render/jobs` — Create render job
- `POST /api/v1/moderation/review` — Submit for moderation
- `GET /api/v1/feed` — Get personalized feed
- `GET /api/v1/admin/*` — Admin dashboard routes

---

## License

Private — YohPal Live

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Support

For issues and questions, please open an issue on [GitHub](https://github.com/isackkibet/video-generetor/issues).
