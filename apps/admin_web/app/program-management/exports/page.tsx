import { requireAdminSession, canAccess } from '../../../lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

const exportsList: [string, string][] = [
  ['Repository Status', 'recovery-governance/exports/repositories'],
  ['Batch Completion', 'recovery-governance/exports/batches'],
  ['Evidence Register', 'recovery-governance/exports/evidence'],
  ['Blockers', 'recovery-governance/exports/blockers'],
  ['Risks', 'recovery-governance/exports/risks'],
  ['Certifications', 'recovery-governance/exports/certifications'],
  ['Executive Approvals', 'recovery-governance/exports/executive-approvals'],
  ['GO/NO-GO Summary', 'recovery-governance/exports/go-no-go-summary'],
];

function exportUrl(path: string, format: 'json' | 'csv') {
  return `${API_BASE_URL}/${path}?format=${format}`;
}

export default async function RecoveryExportsPage() {
  const session = requireAdminSession();
  if (!canAccess(session.role, 'ADMIN')) {
    return <section className="header"><h1>Access Denied</h1></section>;
  }

  return (
    <>
      <section className="header">
        <h1>Recovery Governance Evidence Exports</h1>
        <p>Download executive review evidence in JSON or CSV format.</p>
      </section>

      <section className="card">
        <h3>Complete Evidence Bundle</h3>
        <p>Use this for executive review and production certification. Includes all repositories, batches, evidence, blockers, risks, certifications, executive approvals, and GO/NO-GO summary.</p>
        <a
          className="button"
          href={`${API_BASE_URL}/recovery-governance/exports/bundle`}
        >
          ⬇ Download Complete JSON Bundle
        </a>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <h3>Individual Exports</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Export</th>
              <th>JSON</th>
              <th>CSV</th>
            </tr>
          </thead>
          <tbody>
            {exportsList.map(([label, path]) => (
              <tr key={path}>
                <td>{label}</td>
                <td>
                  <a href={exportUrl(path, 'json')}>⬇ Download JSON</a>
                </td>
                <td>
                  <a href={exportUrl(path, 'csv')}>⬇ Download CSV</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
