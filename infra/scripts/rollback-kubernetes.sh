#!/usr/bin/env bash
set -euo pipefail
: "${KUBE_NAMESPACE:=yohpal-live}"
: "${ROLLBACK_DEPLOYMENT:?ROLLBACK_DEPLOYMENT is required}"

kubectl rollout undo deployment/"$ROLLBACK_DEPLOYMENT" -n "$KUBE_NAMESPACE"
kubectl rollout status deployment/"$ROLLBACK_DEPLOYMENT" -n "$KUBE_NAMESPACE"
echo "Rollback complete for $ROLLBACK_DEPLOYMENT"
