# YOHPAL LIVE AI CONTENT FACTORY
# REPOSITORY-BY-REPOSITORY EXECUTION GUIDE
# BATCH 37A

## Purpose

This guide eliminates developer guesswork.

For every repository it defines:

- Ownership
- Build order
- File execution order
- Responsibilities
- Acceptance criteria
- Test evidence
- Failure scenarios
- Run-to-Green checklist

---

## REPOSITORY 1 – TREND SERVICE

**Repository:** `backend/trend-service`

**Owner:** Content Intelligence Team

**Purpose:** Identify and persist trends that drive seed content generation.

### Folder Ownership

| File | Purpose |
|------|---------|
| `src/main.ts` | Application startup |
| `src/trend.module.ts` | Dependency registration |
| `src/trend.controller.ts` | API endpoints |
| `src/trend.service.ts` | Business logic |
| `src/trend.module.ts` | Module configuration |

### Build Order

1. `main.ts`
2. `trend.module.ts`
3. `trend.controller.ts`
4. `trend.service.ts`
5. Kafka publishing

### Responsibilities

- **Must:** Create trends, store trends, publish trend events
- **Must Not:** Generate scripts, generate videos, moderate content

### Acceptance Criteria

- [ ] Trend created
- [ ] Trend stored
- [ ] Event published
- [ ] Health endpoint working

### Test Evidence Required

- `POST /trends` success response
- `GET /trends` returns list
- Kafka event evidence

### Common Failures

- **Trend duplicates:** Add uniqueness logic.
- **Kafka unavailable:** Verify broker health.

### Run-To-Green Checklist

- [ ] Service starts
- [ ] Health passes
- [ ] Trend insert works
- [ ] Kafka publish works

---

## REPOSITORY 2 – SCRIPT SERVICE

**Repository:** `backend/script-service`

**Owner:** AI Content Team

**Purpose:** Convert trends into scripts.

### Folder Ownership

| File | Purpose |
|------|---------|
| `src/main.ts` | Startup |
| `src/script.module.ts` | Module config |
| `src/script.controller.ts` | API |
| `src/script.service.ts` | Orchestration |
| `ai/agents/` | AI agents |

### Responsibilities

- **Must:** Generate scripts, log LLM activity, persist scripts
- **Must Not:** Render videos, moderate content

### Acceptance Criteria

- [ ] Trend converted to script
- [ ] Script stored
- [ ] Provider log written
- [ ] Event published

### Test Evidence Required

- Generated script
- `ScriptProviderLog` entry
- `script.created` event

### Common Failures

- **Provider timeout:** Use fallback logic
- **Invalid script output:** Reject and retry

### Run-To-Green Checklist

- [ ] Script generation passes
- [ ] Audit log written
- [ ] Kafka event written

---

## REPOSITORY 3 – RENDER SERVICE

**Repository:** `backend/render-service`

**Owner:** Media Pipeline Team

**Purpose:** Generate media assets (TTS, avatar, video composition).

### Responsibilities

- **Must:** Create render jobs, generate TTS, generate avatars, compose videos, store scores
- **Must Not:** Moderate content

### Acceptance Criteria

- [ ] Video created
- [ ] `VideoScore` created
- [ ] `RenderMetadata` created
- [ ] `ProviderJobLog` created

### Test Evidence Required

- Video URL
- Thumbnail URL
- Provider logs
- Render metadata

### Common Failures

- **Avatar failure:** Provider failover
- **TTS failure:** Retry queue

### Run-To-Green Checklist

- [ ] Render complete
- [ ] Metadata stored
- [ ] Score stored

---

## REPOSITORY 4 – MODERATION SERVICE

**Repository:** `backend/moderation-service`

**Owner:** Trust & Safety Team

**Purpose:** Protect platform by moderating content.

### Responsibilities

- **Must:** Moderate content, publish approved videos, log decisions
- **Must Not:** Generate content

### Acceptance Criteria

- [ ] Harmful content blocked
- [ ] Safe content approved
- [ ] Logs written

### Test Evidence Required

- `ModerationLog` entries
- Approval record
- Publishing event

### Common Failures

- **Provider unavailable:** Use human review queue

### Run-To-Green Checklist

- [ ] Moderation passes
- [ ] Publishing passes

---

## REPOSITORY 5 – RECOMMENDATION SERVICE

**Repository:** `backend/recommendation-service`

**Owner:** Feed Intelligence Team

**Purpose:** Personalized ranking and feed generation.

### Responsibilities

- **Must:** Rank feed, learn user interests, record feed events
- **Must Not:** Modify content directly

### Acceptance Criteria

- [ ] Feed generated
- [ ] Learning updated
- [ ] Ranking score calculated

### Test Evidence Required

- Feed response
- `UserInterestProfile` updated
- `FeedEvent` records

### Common Failures

- **Empty feed:** Use seed content fallback

### Run-To-Green Checklist

- [ ] Feed populated
- [ ] Learning updated

---

## REPOSITORY 6 – API GATEWAY

**Repository:** `backend/api-gateway`

**Owner:** Platform Team

**Purpose:** Single entry point for all external requests.

### Responsibilities

- **Must:** Route requests, aggregate health, expose APIs
- **Must Not:** Own business logic

### Acceptance Criteria

- [ ] Routes work
- [ ] Health works
- [ ] Service routing works

### Test Evidence Required

- Gateway health
- API routing

### Run-To-Green Checklist

- [ ] Routing works
- [ ] Service status works

---

## REPOSITORY 7 – ADMIN WEB

**Repository:** `apps/admin_web`

**Owner:** Admin Platform Team

**Purpose:** Operational control center.

### Responsibilities

- **Must:** Show audits, show provider logs, show diagnostics, manage admins
- **Must Not:** Run backend business logic

### Acceptance Criteria

- [ ] Login works
- [ ] RBAC works
- [ ] Dashboards load

### Test Evidence Required

- Screenshots
- Role tests

### Run-To-Green Checklist

- [ ] Admin access works
- [ ] Audit pages work

---

## REPOSITORY 8 – MOBILE APP

**Repository:** `apps/mobile_flutter`

**Owner:** Mobile Team

**Purpose:** User‑facing experience.

### Responsibilities

- **Must:** Show feed, record engagement, display ranked content
- **Must Not:** Run backend logic

### Acceptance Criteria

- [ ] Feed loads
- [ ] Scroll works
- [ ] Events recorded

### Test Evidence Required

- Device screenshots
- Feed responses

### Run-To-Green Checklist

- [ ] Feed visible
- [ ] Events tracked

---

## GLOBAL CERTIFICATION

Before repository sign‑off:

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Health checks pass
- [ ] Logs verified
- [ ] Evidence attached

---

## FINAL RULE

No repository is considered complete until:

- Acceptance criteria met
- Evidence attached
- Run‑to‑Green completed
- Repository lead signs off

No production deployment is permitted without all repository certifications.