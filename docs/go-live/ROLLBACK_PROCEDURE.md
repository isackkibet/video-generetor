# YohPal Live — Rollback Procedure

## Trigger Conditions
Rollback immediately if:
- Feed unavailable > 5 minutes
- Provider failure rate > 20%
- Moderation unavailable
- Database corruption
- Unauthorized publishing
- Security incident

## Steps
1. Disable publishing: `PUBLISHING_ENABLED=false`
2. Switch API Gateway to maintenance mode.
3. Restore previous deployment version.
4. Verify: Health endpoint, Feed endpoint, Admin dashboard.
5. Restore database backup if required.
6. Executive approval required before re-launch.

**Rollback Owner:** Operations Lead
