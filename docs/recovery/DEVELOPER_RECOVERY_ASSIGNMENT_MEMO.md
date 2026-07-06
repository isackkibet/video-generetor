# YOHPAL LIVE AI CONTENT FACTORY
# DEVELOPER RECOVERY ASSIGNMENT MEMO
# BATCH 52

## Purpose

This memo formally assigns recovery responsibilities arising from the Blueprint Diagnostic Report and the Recovery Program (Batches 39–51).

It establishes:

- Repository ownership
- Delivery expectations
- Evidence requirements
- Blocker escalation
- Certification submission format

This memo is binding for all implementation teams.

---

## Recovery Objective

Every repository must recover from the current diagnostic baseline to achieve:

- Blueprint Alignment ≥ 90%
- Zero unresolved HIGH production blockers
- Successful automated regression tests
- Verified production evidence
- Repository certification
- Executive production readiness

---

## Repository Assignments

### Repository 1: API Gateway

**Owner:** Platform Team

**Responsible For:**
- Gateway security
- JWT authentication
- API keys
- RBAC
- Runtime validation
- Metrics endpoint
- Blueprint certification endpoint
- Release gate

**Deliverables:**
- Recovery Batches 39–49
- Evidence package
- Repository certification

---

### Repository 2: Trend Service

**Owner:** Content Intelligence Team

**Responsible For:**
- Trend ingestion
- Trend validation
- Kafka publication
- Health endpoints

---

### Repository 3: Script Service

**Owner:** AI Content Team

**Responsible For:**
- Script generation
- LLM provider integration
- Provider logging
- Kafka consumer (`trend.discovered`)

---

### Repository 4: Render Service

**Owner:** Media Pipeline Team

**Responsible For:**
- Render jobs
- TTS
- Avatar
- Video composition
- Provider resilience
- Video scoring
- Kafka consumer (`script.created`)

---

### Repository 5: Moderation Service

**Owner:** Trust & Safety Team

**Responsible For:**
- Moderation
- Human review
- Publishing
- Moderation metrics
- Kafka consumer (`video.rendered`)

---

### Repository 6: Recommendation Service

**Owner:** Feed Intelligence Team

**Responsible For:**
- Ranking
- Feed learning
- Event consumers
- Feed metrics
- Kafka consumer (`video.published`)

---

### Repository 7: Admin Web

**Owner:** Admin Platform Team

**Responsible For:**
- Recovery dashboards
- Certification dashboards
- Metrics dashboards
- Event dashboards
- Release gate UI

---

### Repository 8: Mobile Flutter

**Owner:** Mobile Team

**Responsible For:**
- Feed UI
- Feed validation
- Engagement tracking
- API compatibility

---

### Repository 9: DevOps

**Owner:** DevOps Team

**Repositories:** `infra/`, `.github/`, `scripts/`

**Responsible For:**
- CI/CD
- Kubernetes
- External Secrets
- Backup
- Restore
- Rollback
- Production deployment

---

## Delivery Expectations

Every repository must deliver:

### Source Code
- Recovery patches applied
- Tests added and passing

### Tests
- Unit tests
- Integration tests
- E2E tests

### Evidence
- Screenshots
- Logs
- API responses
- Health checks

### Documentation
- Repository recovery tracker
- Blocker register
- Risk register

### Certification
- Repository owner sign-off
- Blueprint alignment proof

---

## Evidence Naming Standard

**Pattern:** `YL-<Repository>-<Category>-<YYYYMMDD>-###`

**Examples:**
- `YL-GW-API-20260706-001`
- `YL-SCRIPT-TEST-20260706-002`
- `YL-RENDER-LOG-20260706-003`

**Repository Codes:**

| Repository | Code |
|------------|------|
| API Gateway | GW |
| Trend Service | TREND |
| Script Service | SCRIPT |
| Render Service | RENDER |
| Moderation Service | MOD |
| Recommendation Service | FEED |
| Admin Web | ADMIN |
| Mobile Flutter | MOBILE |
| DevOps | DEVOPS |

---

## Blocker Escalation Process

### Severity 1 – CRITICAL
**Escalate immediately**

Examples:
- Build failure
- Database corruption
- Authentication bypass
- Publishing bypass

**Target:** Immediate

---

### Severity 2 – HIGH
**Escalate within 30 minutes**

Examples:
- Provider failures
- Kafka failures
- Missing metrics

---

### Severity 3 – MEDIUM
**Escalate within one business day**

Examples:
- Dashboard issues
- UI defects

---

## Submission Checklist

Every repository submits:

- [ ] Source code
- [ ] Tests
- [ ] Evidence
- [ ] Blocker register
- [ ] Risk register
- [ ] Repository recovery tracker
- [ ] Repository sign-off

---

## Certification Submission Format

**Package:**
