import { BackupEvidenceService } from '../../backend/shared/backup-evidence.service';

describe('Backup and rollback evidence', () => {
  it('returns backup certification metadata', async () => {
    const service = new BackupEvidenceService();
    const evidence = await service.getBackupEvidence();
    expect(evidence.certificationRequired).toBe(true);
    expect(evidence.kubernetes.cronJob).toBe('postgres-backup');
    expect(evidence.kubernetes.restoreJob).toBe('postgres-restore');
  });
});
