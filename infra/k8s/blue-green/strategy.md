# Blue-Green Deployment Strategy

## Overview
We maintain two identical environments:
- **Blue**: Current production (live traffic)
- **Green**: New release (staging for verification)

## Steps
1. Deploy new version to Green environment.
2. Run smoke tests against Green.
3. Verify feed, moderation, publishing.
4. Switch Ingress traffic from Blue to Green.
5. Monitor for 30 minutes.
6. If issues arise, switch back to Blue (rollback).

## Rollback
- Switch Ingress back to Blue immediately if any critical failure occurs.
- Investigate issues in Green after rollback.
