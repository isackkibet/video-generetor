# YOHPAL LIVE AI CONTENT FACTORY
# FILE-BY-FILE BUILD ORDER MANUAL
# BATCH 37B

## Purpose

This manual defines the exact file‑by‑file order developers must follow when building YohPal Live AI Content Factory from an empty repository to production.

No developer should ask:
- Which file comes first?
- Which folder owns this file?
- Which service depends on this file?
- What should I validate after creating it?

This manual answers those questions.

---

## 1. ROOT FOUNDATION FILES

### 1.1 `package.json`
**Owner:** Platform Team
**Purpose:** Root dependency and command registry.
**Prerequisites:** Empty repository.
**Validation:** `npm install`

### 1.2 `tsconfig.json`
**Owner:** Platform Team
**Purpose:** TypeScript compiler configuration.
**Depends On:** `package.json`

### 1.3 `.env.example`
**Owner:** Platform + DevOps
**Purpose:** Environment variable template.
**Must include:** DATABASE_URL, REDIS_URL, KAFKA_BROKERS, service URLs, provider settings, auth secrets, fallback flags.
**Validation:** `cp .env.example .env`

### 1.4 `.gitignore`
**Owner:** Platform Team
**Purpose:** Prevent secrets and build artifacts entering Git.

### 1.5 `README.md`
**Owner:** Product + Platform
**Purpose:** Main repository operating instructions.

---

## 2. DATABASE FOUNDATION

### 2.1 `prisma/schema.prisma`
**Owner:** Database Lead
**Purpose:** Master schema.
**Must include:** Creator, CreatorTwin, Avatar, Trend, Script, Video, VideoScore, ModerationLog, FeedEvent, AdCampaign, RenderMetadata, ProviderJobLog, ScriptProviderLog, UserInterestProfile, AdminUser, AdminAuditLog.
**Validation:** `npx prisma validate`

### 2.2 `prisma/seed.ts`
**Owner:** Database Lead
**Purpose:** Seed default AI creator, avatars, trends, ad campaigns, and super admin.
**Validation:** `npm run seed`

---

## 3. SHARED BACKEND CORE

### 3.1 `backend/shared/env.ts`
**Purpose:** Central environment resolver.
**Validation:** Services fail clearly if required env is missing.

### 3.2 `backend/shared/prisma.service.ts`
**Purpose:** Shared Prisma connection service.
**Validation:** All NestJS services can inject PrismaService.

### 3.3 `backend/shared/kafka.ts`
**Purpose:** Shared Kafka producer and consumer helper.
**Validation:** Events can be published without duplicate Kafka code.

### 3.4 `backend/shared/http-response.ts`
**Purpose:** Standardized API response format.

### 3.5 `backend/shared/rank-score.ts`
**Purpose:** Shared ranking formula.
**Validation:** Recommendation service imports and uses it.

### 3.6 `contracts/kafka-events.ts`
**Purpose:** Single source of Kafka topics and event payloads.
**Validation:** No service hardcodes topic names elsewhere.

### 3.7 `contracts/api-contracts.ts`
**Purpose:** Shared request contracts.
**Validation:** Controllers and services import request types from here.

---

## 4. AI AGENT LAYER

### 4.1 `ai/prompts/script-prompts.ts`
**Purpose:** Prompt templates for script, fact check, and viral scoring.

### 4.2 `ai/agents/content-strategy.agent.ts`
**Purpose:** Determines format, tone, duration, and safety level.

### 4.3 `ai/agents/script-writer.agent.ts`
**Purpose:** Generates scripts through provider factory.
**Returns:** title, hook, body, cta, providerName, fallbackUsed.

### 4.4 `ai/agents/fact-check.agent.ts`
**Purpose:** Fact and unsafe-claim review.

### 4.5 `ai/agents/viral-prediction.agent.ts`
**Purpose:** Predicts viral probability and engagement scores.

### 4.6 `ai/agents/avatar-director.agent.ts`
**Purpose:** Chooses avatar direction by category.

### 4.7 `ai/workflows/content-generation.workflow.ts`
**Purpose:** Orchestrates strategy, script, fact check, viral score, avatar direction.
**Validation:** One workflow call returns complete script package.

---

## 5. TREND SERVICE FILES

### 5.1 `backend/trend-service/package.json`
**Validation:** `npx ts-node backend/trend-service/src/main.ts`

### 5.2 `backend/trend-service/Dockerfile`
**Validation:** Docker build succeeds.

### 5.3 `backend/trend-service/src/main.ts`
**Expected Port:** 3001
**Validation:** `curl http://localhost:3001/health`

### 5.4 `backend/trend-service/src/trend.module.ts`
**Purpose:** Register controller, service, Prisma, middleware, health.

### 5.5 `backend/trend-service/src/trend.service.ts`
**Purpose:** create trends, list trends, discover seed trends, publish trend.discovered.
**Validation:** `curl -X POST http://localhost:3001/trends/discover-seed`

### 5.6 `backend/trend-service/src/trend.controller.ts`
**Purpose:** Expose trend endpoints.
**Validation:** `curl http://localhost:3001/trends`

---

## 6. SCRIPT SERVICE FILES

### 6.1 `backend/script-service/package.json`
### 6.2 `backend/script-service/Dockerfile`
### 6.3 `backend/script-service/src/main.ts`
**Expected Port:** 3002
**Validation:** `curl http://localhost:3002/health`

### 6.4 `backend/script-service/src/script.module.ts`
### 6.5 `backend/script-service/src/script.service.ts`
**Purpose:** generate scripts, log provider calls, persist scripts, publish script.created.
**Validation:** `curl -X POST "http://localhost:3002/scripts/generate-pending?take=10"`

### 6.6 `backend/script-service/src/script.controller.ts`
**Validation:** `curl http://localhost:3002/scripts`

---

## 7. RENDER SERVICE FILES

### 7.1 `backend/render-service/package.json`
### 7.2 `backend/render-service/Dockerfile`
### 7.3 `backend/render-service/src/main.ts`
**Expected Port:** 3003
**Validation:** `curl http://localhost:3003/health`

### 7.4 `backend/render-service/src/render.module.ts`
### 7.5 `backend/render-service/src/media-render.pipeline.ts`
**Purpose:** run TTS provider, run avatar provider, run video compositor, log provider jobs.
**Validation:** `ProviderJobLog` entries created.

### 7.6 `backend/render-service/src/render.service.ts`
**Purpose:** create video jobs, create VideoScore, render video, persist RenderMetadata.
**Validation:** `curl -X POST "http://localhost:3003/render/jobs/create-pending?take=10"`

### 7.7 `backend/render-service/src/render.controller.ts`
**Validation:** `curl http://localhost:3003/render/videos`

---

## 8. MODERATION SERVICE FILES

### 8.1 `backend/moderation-service/package.json`
### 8.2 `backend/moderation-service/Dockerfile`
### 8.3 `backend/moderation-service/src/main.ts`
**Expected Port:** 3004
**Validation:** `curl http://localhost:3004/health`

### 8.4 `backend/moderation-service/src/moderation.module.ts`
### 8.5 `backend/moderation-service/src/moderation.service.ts`
**Purpose:** moderate videos, write ModerationLog, publish approved videos.
**Validation:** `curl -X POST "http://localhost:3004/moderation/videos/moderate-pending?take=10"`

### 8.6 `backend/moderation-service/src/moderation.controller.ts`
**Validation:** `curl http://localhost:3004/moderation/queue`

---

## 9. RECOMMENDATION SERVICE FILES

### 9.1 `backend/recommendation-service/package.json`
### 9.2 `backend/recommendation-service/Dockerfile`
### 9.3 `backend/recommendation-service/src/main.ts`
**Expected Port:** 3005
**Validation:** `curl http://localhost:3005/health`

### 9.4 `backend/recommendation-service/src/recommendation.module.ts`
### 9.5 `backend/recommendation-service/src/recommendation.service.ts`
**Purpose:** fetch published videos, calculate rank score, apply viral boost, record feed events, update user interests.
**Validation:** `curl "http://localhost:3005/feed/seed?userId=demo-user&region=Nairobi&country=Kenya"`

### 9.6 `backend/recommendation-service/src/recommendation.controller.ts`
**Validation:** `curl http://localhost:3005/feed/diagnostics/demo-user`

---

## 10. API GATEWAY FILES

### 10.1 `backend/api-gateway/package.json`
### 10.2 `backend/api-gateway/Dockerfile`
### 10.3 `backend/api-gateway/src/main.ts`
**Expected Port:** 3000
**Validation:** `curl http://localhost:3000/health`

### 10.4 `backend/api-gateway/src/app.module.ts`
### 10.5 `backend/api-gateway/src/gateway.service.ts`
**Validation:** `curl -X POST "http://localhost:3000/pipeline/run-seed?take=10"`

### 10.6 `backend/api-gateway/src/gateway.controller.ts`
**Validation:** `curl "http://localhost:3000/feed/seed?userId=demo-user&region=Nairobi&country=Kenya"`

### 10.7 `backend/api-gateway/src/api-key.middleware.ts`
**Purpose:** Protect gateway outside development.

---

## 11. PROVIDER FILES

### 11.1 `ai/providers/interfaces/*.ts`
**Purpose:** Define provider contracts: LLM, TTS, Avatar, Video Compositor, Moderation.

### 11.2 `ai/providers/yohpal-brain/*.ts`
**Purpose:** YohPal Brain production adapters.

### 11.3 `ai/providers/mock/*.ts`
**Purpose:** Development mock providers.

### 11.4 `ai/providers/provider-factory.ts`
**Purpose:** Select real or mock providers based on env.

---

## 12. SHARED AUDIT + LEARNING FILES

### 12.1 `backend/shared/provider-job-logger.ts`
### 12.2 `backend/shared/provider-job-query.service.ts`
### 12.3 `backend/shared/script-provider-logger.ts`
### 12.4 `backend/shared/script-provider-query.service.ts`
### 12.5 `backend/shared/feed-learning.service.ts`
### 12.6 `backend/shared/observability-query.service.ts`
### 12.7 `backend/shared/logger.ts`
### 12.8 `backend/shared/request-id.middleware.ts`
### 12.9 `backend/shared/health.controller.ts`
### 12.10 `backend/shared/service-auth.middleware.ts`

---

## 13. DOCKER + INFRA FILES

### 13.1 `infra/docker-compose.yml`
### 13.2 `infra/nginx/nginx.conf`

---

## 14. FLUTTER MOBILE FILES

### 14.1 `apps/mobile_flutter/pubspec.yaml`
### 14.2 `apps/mobile_flutter/lib/main.dart`
### 14.3 `apps/mobile_flutter/lib/core/env.dart`
### 14.4 `apps/mobile_flutter/lib/core/api_client.dart`
### 14.5 `apps/mobile_flutter/lib/features/live_feed/data/video_model.dart`
### 14.6 `apps/mobile_flutter/lib/features/live_feed/data/feed_repository.dart`
### 14.7 `apps/mobile_flutter/lib/features/live_feed/presentation/live_feed_screen.dart`
### 14.8 `apps/mobile_flutter/lib/features/live_feed/presentation/video_card.dart`

---

## 15. ADMIN WEB FILES

### 15.1 `apps/admin_web/package.json`
### 15.2 `apps/admin_web/next.config.js`
### 15.3 `apps/admin_web/lib/api.ts`
### 15.4 `apps/admin_web/lib/auth.ts`
### 15.5 `apps/admin_web/lib/session.ts`
### 15.6 `apps/admin_web/lib/rbac.ts`
### 15.7 `apps/admin_web/lib/action-guard.ts`
### 15.8 `apps/admin_web/lib/admin-actions.ts`
### 15.9 `apps/admin_web/lib/admin-audit-query.ts`
### 15.10 `apps/admin_web/lib/action-result.ts`
### 15.11 `apps/admin_web/lib/pipeline-actions.ts`
### 15.12 `apps/admin_web/components/FlashMessage.tsx`
### 15.13 `apps/admin_web/app/layout.tsx`
### 15.14 `apps/admin_web/app/styles.css`
### 15.15 `apps/admin_web/app/page.tsx`
### 15.16 Admin Pages: trends, scripts, videos, moderation, provider-jobs, script-provider-logs, feed-diagnostics, admin-users, admin-audit-logs, observability, login

---

## 16. CI/CD FILES

### 16.1 `.github/workflows/ci.yml`
### 16.2 `.github/workflows/deploy-production.yml`

---

## 17. KUBERNETES FILES

### 17.1 `infra/k8s/base/namespace.yaml`
### 17.2 `infra/k8s/config/app-config.yaml`
### 17.3 `infra/k8s/secrets/app-secrets.yaml`
### 17.4 Service Deployments: api-gateway, trend-service, script-service, render-service, moderation-service, recommendation-service
### 17.5 `infra/k8s/production/ingress.yaml`
### 17.6 `infra/k8s/hpa/*-hpa.yaml`
### 17.7 `infra/k8s/blue-green/strategy.md`
### 17.8 `infra/k8s/production/disaster-recovery.md`

---

## 18. GO-LIVE DOCUMENTATION FILES

### 18.1 `docs/go-live/PRODUCTION_READINESS_CHECKLIST.md`
### 18.2 `docs/go-live/SMOKE_TEST_PLAN.md`
### 18.3 `docs/go-live/ROLLBACK_PROCEDURE.md`
### 18.4 `docs/go-live/SECURITY_CERTIFICATION.md`
### 18.5 `docs/go-live/MODERATION_CERTIFICATION.md`
### 18.6 `docs/go-live/LAUNCH_AUTHORIZATION.md`
### 18.7 `docs/go-live/GO_LIVE_RUNBOOK.md`

---

## 19. GOVERNANCE FILES

### 19.1 `docs/DEVELOPER_HANDOVER_MEMO.md`
### 19.2 `docs/go-live/executive/EXECUTIVE_PRODUCTION_AUTHORIZATION_PACK.md`
### 19.3 `docs/go-live/executive/LAUNCH_EVIDENCE_INDEX.md`
### 19.4 `docs/go-live/executive/EXECUTIVE_GO_LIVE_MINUTES.md`
### 19.5 `docs/operations/PRODUCTION_OPERATIONS_SUPPORT_MANUAL.md`
### 19.6 `docs/master-authorization/YOHPAL_LIVE_MASTER_AUTHORIZATION_PACK.md`
### 19.7 `docs/master-authorization/PRODUCTION_GATE_MATRIX.md`
### 19.8 `docs/master-authorization/EXECUTIVE_SIGNOFF_REGISTER.md`
### 19.9 `docs/master-authorization/MASTER_RELEASE_RECORD.md`

---

## 20. FINAL BUILD VALIDATION SEQUENCE

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
docker compose -f infra/docker-compose.yml up --build