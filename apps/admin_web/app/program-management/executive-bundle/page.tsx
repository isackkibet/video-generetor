import { requireAdminSession, canAccess } from '../../../lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export default async function ExecutiveBundlePage() {
  const session = requireAdminSession();
  if (!canAccess(session.role, 'ADMIN')) {
    return <section className="header"><h1>Access Denied</h1></section>;
  }

  return (
    <>
      <section className="header">
        <h1>Executive Evidence Bundle</h1>
        <p>
          Generate and download the complete evidence bundle required for board,
          management, and executive production approval.
        </p>
      </section>

      <section className="card">
        <h3>Download Complete Executive Bundle</h3>
        <p>
          This bundle includes recovery governance exports, blueprint certification,
          GO/NO-GO release gate, backup evidence, and production readiness evidence.
        </p>
        <a
          className="button"
          href={`${API_BASE_URL}/recovery-governance/exports/executive-bundle`}
        >
          ⬇ Download Executive JSON Bundle
        </a>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <h3>Required Manual Attachments</h3>
        <ul>
          <li>Program Management Dashboard screenshot</li>
          <li>Recovery Data screenshot</li>
          <li>Recovery Evidence screenshot</li>
          <li>Release Gate screenshot</li>
          <li>Metrics Evidence screenshot</li>
          <li>Backup Evidence screenshot</li>
          <li>Repository lead signed sign-off forms</li>
          <li>Executive approval signature</li>
        </ul>
      </section>
    </>
  );
}
