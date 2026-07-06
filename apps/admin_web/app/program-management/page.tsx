import { apiGet, ApiResponse } from '../../lib/api';
import { requireAdminSession, canAccess } from '../../lib/auth';

type RepositoryStatus = {
  repository: string;
  owner: string;
  batchesCompleted: number;
  totalBatches: number;
  progressPercent: number;
  alignmentScore: number;
  certificationStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'READY_FOR_REVIEW' | 'CERTIFIED';
  blockers: number;
  risks: number;
  evidenceSubmitted: boolean;
};

type ExecutiveReadiness = {
  blueprintAlignment: number;
  repositoriesCertified: number;
  repositoriesTotal: number;
  executiveReadinessScore: number;
  decision: 'GO' | 'NO-GO';
};

type DashboardData = {
  generatedAt: string;
  repositories: RepositoryStatus[];
  executiveReadiness: ExecutiveReadiness;
  summary: {
    totalRepositories: number;
    certified: number;
    avgAlignment: number;
    totalBlockers: number;
    totalRisks: number;
    evidenceSubmitted: number;
    readinessScore: number;
    decision: 'GO' | 'NO-GO';
  };
};

async function getDashboard() {
  try {
    const response = await apiGet<ApiResponse<DashboardData>>(
      '/program-management/dashboard'
    );
    return response.data;
  } catch {
    return null;
  }
}

export default async function ProgramManagementPage() {
  const session = requireAdminSession();
  if (!canAccess(session.role, 'ADMIN')) {
    return (
      <section className="header">
        <h1>Access Denied</h1>
        <p>Only super admins can view the program management dashboard.</p>
      </section>
    );
  }

  const dashboard = await getDashboard();

  if (!dashboard) {
    return (
      <section className="header">
        <h1>Program Management</h1>
        <p>Failed to load dashboard data. Please try again later.</p>
      </section>
    );
  }

  const { repositories, executiveReadiness, summary } = dashboard;

  return (
    <>
      <section className="header">
        <h1>Executive Recovery Command Center</h1>
        <p>Program-wide recovery progress, certification status, and readiness metrics.</p>
      </section>

      <section className="grid cols-4">
        <div className="card">
          <h3>Blueprint Alignment</h3>
          <div className="statValue">{executiveReadiness.blueprintAlignment}%</div>
        </div>
        <div className="card">
          <h3>Repositories Certified</h3>
          <div className="statValue">{executiveReadiness.repositoriesCertified} / {executiveReadiness.repositoriesTotal}</div>
        </div>
        <div className="card">
          <h3>Executive Readiness</h3>
          <div className="statValue">{executiveReadiness.executiveReadinessScore}%</div>
        </div>
        <div className="card">
          <h3>GO / NO-GO</h3>
          <div className="statValue" style={{ color: executiveReadiness.decision === 'GO' ? '#34d399' : '#f87171' }}>
            {executiveReadiness.decision}
          </div>
        </div>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <h3>Repository Progress</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Repository</th>
              <th>Owner</th>
              <th>Batches</th>
              <th>Progress</th>
              <th>Alignment</th>
              <th>Status</th>
              <th>Blockers</th>
              <th>Risks</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            {repositories.map((repo) => (
              <tr key={repo.repository}>
                <td>{repo.repository}</td>
                <td>{repo.owner}</td>
                <td>{repo.batchesCompleted} / {repo.totalBatches}</td>
                <td>{repo.progressPercent}%</td>
                <td>{repo.alignmentScore}%</td>
                <td>
                  <span className="badge" style={{ background: repo.certificationStatus === 'CERTIFIED' ? '#064e3b' : '#1e3a5f' }}>
                    {repo.certificationStatus}
                  </span>
                </td>
                <td>{repo.blockers}</td>
                <td>{repo.risks}</td>
                <td>{repo.evidenceSubmitted ? '✅' : '❌'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
