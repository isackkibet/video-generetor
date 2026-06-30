import { requireAdminSession, canAccess } from "../../lib/auth";
import {
  getAdminAuditSummary,
  listAdminAuditLogs,
} from "../../lib/admin-audit-query";
export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: {
    actorId?: string;
    targetId?: string;
    action?: string;
    take?: string;
  };
}) {
  const session = requireAdminSession();
  if (!canAccess(session.role, "ADMIN")) {
    return (
      <>
        <section className="header">
          <h1>Access Denied</h1>
          <p>Only super admins can view admin audit logs.</p>
        </section>
      </>
    );
  }
  const [summary, logs] = await Promise.all([
    getAdminAuditSummary(),
    listAdminAuditLogs({
      actorId: searchParams.actorId,
      targetId: searchParams.targetId,
      action: searchParams.action,
      take: searchParams.take ? Number(searchParams.take) : 100,
    }),
  ]);
  return (
    <>
      <section className="header">
        <h1>Admin Audit Logs</h1>
        <p>
          Track admin user management actions, actor IDs, target IDs, and
          metadata.
        </p>
      </section>
      <section className="grid cols-4">
        <div className="card">
          <h3>Total</h3>
          <div className="statValue">{summary.total}</div>
        </div>
        <div className="card">
          <h3>Created</h3>
          <div className="statValue">{summary.created}</div>
        </div>
        <div className="card">
          <h3>Role Changes</h3>
          <div className="statValue">{summary.roleChanged}</div>
        </div>
        <div className="card">
          <h3>Password Resets</h3>
          <div className="statValue">{summary.passwordReset}</div>
        </div>
      </section>
      <section className="card" style={{ marginTop: 20 }}>
        <h3>Filters</h3>
        <form className="actions">
          <select name="action" defaultValue={searchParams.action || ""}>
            <option value="">All actions</option>
            <option value="ADMIN_CREATED">Admin created</option>
            <option value="ADMIN_ROLE_CHANGED">Role changed</option>
            <option value="ADMIN_DEACTIVATED">Admin deactivated</option>
            <option value="ADMIN_REACTIVATED">Admin reactivated</option>
            <option value="ADMIN_PASSWORD_RESET">Password reset</option>
          </select>
          <input
            name="actorId"
            placeholder="Actor admin ID"
            defaultValue={searchParams.actorId || ""}
          />
          <input
            name="targetId"
            placeholder="Target admin ID"
            defaultValue={searchParams.targetId || ""}
          />
          <input
            name="take"
            type="number"
            placeholder="Limit"
            defaultValue={searchParams.take || "100"}
          />
          <button type="submit">Apply filters</button>
        </form>
      </section>
      <section className="card" style={{ marginTop: 20 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Action</th>
              <th>Actor ID</th>
              <th>Target ID</th>
              <th>Metadata</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
                <td>
                  <span className="badge">{log.action}</span>
                </td>
                <td>{log.actorId || "-"}</td>
                <td>{log.targetId || "-"}</td>
                <td>
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      maxWidth: 360,
                      overflowX: "auto",
                    }}
                  >
                    {JSON.stringify(log.metadata || {}, null, 2)}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
