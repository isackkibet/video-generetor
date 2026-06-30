# Disaster Recovery Runbook

## Recovery Targets
- **RPO**: 15 Minutes
- **RTO**: 30 Minutes

## Scenarios
- Database failure
- Kafka failure
- Redis failure
- Cluster failure

## Actions
1. Restore PostgreSQL from latest Point-In-Time Recovery (PITR) backup.
2. Restore Kafka topics from replicated logs.
3. Restore Redis from snapshot.
4. Redeploy Kubernetes manifests.
5. Verify health endpoints, feed, publishing, moderation.

## Verification
- [ ] Health endpoints return 200.
- [ ] Feed returns videos.
- [ ] Publishing works.
- [ ] Moderation queue accessible.
