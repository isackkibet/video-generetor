import { apiGet, ApiResponse } from "../../lib/api";
import { requireAdminSession, canAccess } from "../../lib/auth";
type BackupEvidence = {
  generatedAt: string;
  backupPolicy: {
    postgresSchedule: string;
    retention: string;
    storage: string;
    verification: string;
  };
  kubernetes: {
    cronJob: string;
    namespace: string;
    restoreJob: string;
  };
  certificationRequired: boolean;
};
async function getBackupEvidence() {
  try {
    const response = await apiGet<ApiResponse<BackupEvidence>>(
      "/observability/backup-evidence",
    );
    return response.data;
  } catch {
    return null;
  }
}
export default async function BackupPage() {
  const session = requireAdminSession();
  if (!canAccess(session.role, "ADMIN")) {
    return (
      <>
        <section className="header">
          <h1>Access Denied</h1>
        </section>
      </>
    );
  }
  const evidence = await getBackupEvidence();
  return (
    <>
      <section className="header">
        <h1>Backup & Restore Evidence</h1>
        <p>Production backup, restore, and certification evidence.</p>
      </section>
      <section className="grid cols-4">
        <div className="card">
          <h3>Schedule</h3>
          <div className="statValue">
            {evidence?.backupPolicy.postgresSchedule || "-"}
          </div>
        </div>
        <div className="card">
          <h3>Retention</h3>
          <div className="statValue">
            {evidence?.backupPolicy.retention || "-"}
          </div>
        </div>
        <div className="card">
          <h3>CronJob</h3>
          <div className="statValue">{evidence?.kubernetes.cronJob || "-"}</div>
        </div>
        <div className="card">
          <h3>Restore Job</h3>
          <div className="statValue">
            {evidence?.kubernetes.restoreJob || "-"}
          </div>
        </div>
      </section>
      <section className="card" style={{ marginTop: 20 }}>
        <h3>Evidence JSON</h3>
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {JSON.stringify(evidence || {}, null, 2)}
        </pre>
      </section>
    </>
  );
}
