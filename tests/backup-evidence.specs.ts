import { BackupEvidenceService } from "../backend/shared/backup-evidence.service";
describe("BackupEvidenceService", () => {
  it("returns backup certification evidence metadata", async () => {
    const service = new BackupEvidenceService();
    const evidence = await service.getBackupEvidence();
    expect(evidence.backupPolicy.postgresSchedule).toBeDefined();
    expect(evidence.kubernetes.cronJob).toBe("postgres-backup");
    expect(evidence.certificationRequired).toBe(true);
  });
});
