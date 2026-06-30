# YohPal Live AI Content Factory
## Final Developer Handover Manual v1.0

---

## 1. Purpose

This manual consolidates **Batches 1–31** into one authoritative execution guide.

**Developer questions such as:**
- Where should this file go?
- Which service owns this logic?
- Which event should I publish?
- Which database table should I use?
- Which API should I call?
- Which deployment sequence should I follow?

**Are answered by this manual.**

**No implementation may contradict this document.**

---

## 2. System Ownership Model

### API Gateway
**Owns:**
- External API exposure
- Service routing
- Health aggregation
- Observability aggregation

**Must NOT own:**
- Business logic
- Rendering logic
- Moderation logic

### Trend Service
**Owns:**
- Trend discovery
- Trend persistence
- Trend publication

**Tables:**
- `Trend`

**Kafka Events:**
- `trend.discovered`

### Script Service
**Owns:**
- Script generation
- LLM provider calls
- Script provider logging

**Tables:**
- `Script`
- `ScriptProviderLog`

**Kafka Events:**
- `script.created`

### Render Service
**Owns:**
- Video job creation
- Media rendering pipeline
- Provider orchestration

**Tables:**
- `Video`
- `VideoScore`
- `RenderMetadata`
- `ProviderJobLog`

**Kafka Events:**
- `video.render.requested`
- `video.rendered`
- `video.scored`

### Moderation Service
**Owns:**
- Moderation decisions
- Publishing authorization
- Safety review

**Tables:**
- `ModerationLog`

**Kafka Events:**
- `video.moderated`
- `video.published`

### Recommendation Service
**Owns:**
- Feed ranking
- Feed events
- User learning

**Tables:**
- `FeedEvent`
- `UserInterestProfile`

**Kafka Events:**
- `feed.event.created`

### Admin & Auth
**Tables:**
- `AdminUser`
- `AdminAuditLog`

---

## 3. Repository Map


## 4. Mandatory Execution Order

### Phase 1 (Foundation)
1. Batch 1 – Root Project Foundation
2. Batch 2 – Prisma Database Schema + Seed
3. Batch 3 – Shared Backend Core
4. Batch 4 – AI Agent Orchestration Layer

### Phase 2 (Core Services)
5. Batch 5 – Trend Service
6. Batch 6 – Script Service
7. Batch 7 – Render Service
8. Batch 8 – Moderation Service
9. Batch 9 – Recommendation Service
10. Batch 10 – API Gateway

### Phase 3 (Applications)
11. Batch 11 – Docker Compose Infrastructure
12. Batch 12 – Flutter Mobile Feed
13. Batch 13 – Admin Web Dashboard

### Phase 4 (Operations)
14. Batch 14 – CI/CD
15. Batch 15 – Real AI Providers
16. Batch 16 – Integrate Providers
17. Batch 17 – Provider Metadata
18. Batch 18 – Provider Job Audit
19. Batch 19 – Script Provider Logging
20. Batch 20 – Script Audit Detail
21. Batch 21 – Viral Scoring
22. Batch 22 – Feed Learning

### Phase 5 (Security)
23. Batch 23 – Admin RBAC
24. Batch 24 – JWT Login
25. Batch 25 – RBAC Enforcement
26. Batch 26 – Admin CRUD
27. Batch 27 – Audit Logs
28. Batch 28 – Toast Feedback
29. Batch 29 – Observability

### Phase 6 (Production)
30. Batch 30 – Readiness Checklist
31. Batch 31 – Kubernetes Deployment
32. Batch 32 – Developer Handover (THIS FILE)

**No batch may be skipped.**

---

## 5. Database Ownership

| Table | Owner | Service |
| :--- | :--- | :--- |
| `Trend` | Trend Service | trend-service |
| `Script` | Script Service | script-service |
| `ScriptProviderLog` | Script Service | script-service |
| `Video` | Render Service | render-service |
| `VideoScore` | Render Service | render-service |
| `RenderMetadata` | Render Service | render-service |
| `ProviderJobLog` | Render Service | render-service |
| `ModerationLog` | Moderation Service | moderation-service |
| `FeedEvent` | Recommendation Service | recommendation-service |
| `UserInterestProfile` | Recommendation Service | recommendation-service |
| `AdminUser` | Admin/Auth | shared |
| `AdminAuditLog` | Admin/Auth | shared |

**No service may write directly into another service's tables except through defined workflows.**

---

## 6. Event Ownership

| Event | Owner | Consumers |
| :--- | :--- | :--- |
| `trend.discovered` | Trend Service | Script Service |
| `script.created` | Script Service | Render Service |
| `video.render.requested` | Render Service | Render Workers |
| `video.rendered` | Render Service | Moderation Service |
| `video.scored` | Render Service | Recommendation Service |
| `video.moderated` | Moderation Service | Publishing Workflow |
| `video.published` | Moderation Service | Recommendation Service |
| `feed.event.created` | Recommendation Service | Learning Engine |

---

## 7. Development Rules (Binding)

**Developers SHALL NOT:**
- Rename events
- Rename services
- Rename database tables
- Bypass moderation
- Publish unmoderated videos
- Disable audit logs
- Hardcode secrets
- Disable RBAC

---

## 8. Production Environment Requirements

**Must exist:**
- PostgreSQL HA
- Redis HA
- Kafka HA
- Kubernetes
- TLS
- Backups
- Observability
- Audit Logging

---

## 9. Deployment Sequence

1. Deploy PostgreSQL
2. Deploy Redis
3. Deploy Kafka
4. Apply Namespace
5. Apply Secrets
6. Apply ConfigMaps
7. Deploy Services (Trend → Script → Render → Moderation → Recommendation → Gateway)
8. Apply Ingress
9. Apply HPA
10. Run Smoke Tests

---

## 10. Troubleshooting Guide

### Trend Service Down
Check:
- PostgreSQL
- Kafka health endpoint

### Script Service Failure
Check:
- LLM provider
- ScriptProviderLog

### Render Failure
Check:
- ProviderJobLog
- RenderMetadata
- TTS provider
- Avatar provider

### Moderation Failure
Check:
- Moderation provider
- ModerationLog

### Feed Issues
Check:
- VideoScore
- FeedEvent
- UserInterestProfile

---

## 11. Certification Requirements

### Engineering Lead
- Code complete
- Tests pass

### Security Lead
- Secrets secure
- RBAC verified
- JWT validated

### Content Safety Lead
- Moderation verified
- Publishing controls verified

### Operations Lead
- Backups verified
- Monitoring verified
- Recovery verified

### Executive Sponsor
- Launch approval issued

---

## 12. Production Authorization

**Production launch is prohibited until:**
- ✅ Smoke Tests Pass
- ✅ Security Certification Passes
- ✅ Moderation Certification Passes
- ✅ Readiness Checklist Passes
- ✅ Launch Authorization Signed

**Required signatures:**
- Engineering Lead
- Security Lead
- Content Safety Lead
- Operations Lead
- Executive Sponsor

**Without all approvals:**
**PRODUCTION DEPLOYMENT IS FORBIDDEN.**

---

## 13. Developer Binding Statement

This manual is the single source of truth.

Any implementation that contradicts this manual is considered non-compliant.

Developers must follow this manual exactly.

**No guessing.**
**No architecture changes.**
**No ownership changes.**
**No bypassing controls.**
**No production deployment before certification.**

---

*This document is binding. It supersedes all other documentation, verbal instructions, and personal opinions.*
