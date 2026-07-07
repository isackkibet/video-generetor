# Post-Approval Deployment Instruction

Deployment may begin only after:

- [ ] GO decision recorded
- [ ] Production authorization signed
- [ ] Executive Evidence Bundle archived
- [ ] Release version confirmed
- [ ] Rollback owner assigned
- [ ] Monitoring team on standby

## Deployment Steps

1. Confirm release version
2. Confirm production secrets
3. Confirm backup completed
4. Deploy using approved production workflow
5. Run production smoke tests
6. Verify health endpoints
7. Verify feed
8. Verify moderation
9. Verify metrics
10. Record deployment evidence

## Immediate Rollback Triggers

Rollback immediately if:

- Feed unavailable
- Moderation unavailable
- Unauthorized publishing detected
- API Gateway unavailable
- Provider failure exceeds approved threshold
- Security issue detected

## Deployment Owner

**Name:** _________
**Signature:** _________
**Date:** _________
