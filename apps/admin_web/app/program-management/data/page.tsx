import { apiGet, apiPost, ApiResponse } from '../../../lib/api';
import { requireAdminSession, canAccess } from '../../../lib/auth';

type DashboardData = {
  generatedAt: string;
  repositories: {
    id: string;
    code: string;
    name: string;
    owner: string;
    status: string;
    alignmentScore: number;
    evidenceSubmitted: boolean;
  }[];
  summary: {
    repositoriesTotal: number;
    repositoriesCertified: number;
    avgAlignment: number;
    blockersTotal: number;
    highOpenBlockers: number;
    risksTotal: number;
    evidenceSubmitted: number;
    evidenceAccepted: number;
    executiveReadinessScore: number;
    decision: 'GO' | 'NO-GO';
  };
};

async function getDashboard() {
  try {
    const response = await apiGet<ApiResponse<DashboardData>>('/recovery-governance/dashboard');
    return response.data;
  } catch {
    return null;
  }
}

async function seedRepositories() {
  'use server';
  await apiPost('/recovery-governance/seed');
}

export default async function RecoveryGovernanceDataPage() {
  const session = requireAdminSession();
  if (!canAccess(session.role, 'ADMIN')) {
    return (
      <section className="header">
        <h1>Access Denied</h1>
      </section>
    );
  }

  const dashboard = await getDashboard();

  return (
    <>
      <section className="header">
        <h1>Recovery Governance Data Center</h1>
        <p>Database-backed recovery tracking, evidence, risks, blockers, and certification status.</p>
      </section>

      <form action={seedRepositories} className="actions">
        <button type="submit">Seed Default Repositories</button>
      </form>

      <section className="grid cols-4">
        <div className="card">
          <h3>Decision</h3>
          <div className="statValue">{dashboard?.summary.decision || 'NO-GO'}</div>
        </div>
        <div className="card">
          <h3>Alignment</h3>
          <div className="statValue">{dashboard?.summary.avgAlignment || 0}%</div>
        </div>
        <div className="card">
          <h3>Certified</h3>
          <div className="statValue">
            {dashboard?.summary.repositoriesCertified || 0}/{dashboard?.summary.repositoriesTotal || 0}
          </div>
        </div>
        <div className="card">
          <h3>Readiness</h3>
          <div className="statValue">{dashboard?.summary.executiveReadinessScore || 0}%</div>
        </div>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <h3>Repository Recovery Records</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Repository</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Alignment</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            {(dashboard?.repositories || []).map((repo) => (
              <tr key={repo.id}>
                <td>{repo.code}</td>
                <td>{repo.name}</td>
                <td>{repo.owner}</td>
                <td>{repo.status}</td>
                <td>{repo.alignmentScore}%</td>
                <td>{repo.evidenceSubmitted ? 'Submitted' : 'Pending'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
