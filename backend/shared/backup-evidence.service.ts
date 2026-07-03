import { Injectable } from "@nestjs/common";

@Injectable()
export class BackupEvidenceService {
  async getBackupEvidence() {
    return {
      generatedAt: new Date().toISOString(),
      backupPolicy: {
        postgresSchedule: "Every 6 hours",
        retention: "30 days recommended",
        storage: "External object storage",
        verification: "Restore test required",
      },
      kubernetes: {
        cronJob: "postgres-backup",
        namespace: "yohpal-live",
        restoreJob: "postgres-restore",
      },
      certificationRequired: true,
    };
  }
}
