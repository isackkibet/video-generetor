# Secret Rotation Runbook

## Scope

Applies to:

- DATABASE_URL
- REDIS_URL
- ADMIN_JWT_SECRET
- API_GATEWAY_KEY
- SERVICE_AUTH_KEY
- AI_GATEWAY_URL

## Steps

1. Create new secret value in production secret manager.
2. Update ExternalSecret remote value.
3. Wait for ExternalSecret refresh.
4. Restart affected deployments.
5. Verify health endpoints.
6. Verify admin login.
7. Verify service-to-service calls.
8. Revoke old secret.
9. Record evidence ID.

## Validation

````bash
kubectl get externalsecret -n yohpal-live
kubectl rollout restart deployment/api-gateway -n yohpal-live
kubectl rollout status deployment/api-gateway -n yohpal-live

