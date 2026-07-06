import { apiGet, ApiResponse } from '../../../lib/api';
import { FlashMessage } from '../../../components/FlashMessage';
import { requireAdminSession, canAccess } from '../../../lib/auth';
import {
  seedRecoveryRepositoriesAction,
  createRecoveryRepositoryAction,
  updateRecoveryRepositoryAction
} from '../../../lib/recovery-governance-actions';

type Repo = {
  id: string;
  code: string;
  name: string;
  owner: string;
  repositoryPath: string;
  status: string;
  alignmentScore: number;
  evidenceSubmitted: boolean;
};

type Dashboard = {
  summary: {
    repositoriesTotal: number;
    repositoriesCertified: number;
    avgAlignment: number;
    highOpenBlockers: number;
    evidenceSubmitted: number;
    evidenceAccepted: number;
    executiveReadinessScore: number;
    decision: 'GO' | 'NO-GO';
  };
  repositories: Repo[];
};

async function getDashboard() {
  try {
    const response = await apiGet<ApiResponse<Dashboard>>('/recovery-governance/dashboard');
    return response.data;
  } catch {
    return null;
  }
}

export default async function ProgramManagementDataPage({
  searchParams
}: {
  searchParams: { success?: string; error?: string };
}) {
  const session = requireAdminSession();
  if (!canAccess(session.role, 'ADMIN')) {
    return (
      <section className="header">
        <h1>Access Denied</h1>
      </section>
    );
  }

  const dashboard = await getDashboard();
  const repositories = dashboard?.repositories || [];

  return (
    <>
      <section className="header">
        <h1>Recovery Governance Data Center</h1>
        <p>Manage repository recovery status, alignment score, and evidence submission.</p>
      </section>

      <FlashMessage success={searchParams.success} error={searchParams.error} />

      <form action={seedRecoveryRepositoriesAction} className="actions">
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
        <h3>Create Repository</h3>
        <form action={createRecoveryRepositoryAction} className="grid">
          <input name="code" placeholder="Code e.g. GW" required />
          <input name="name" placeholder="Repository name" required />
          <input name="owner" placeholder="Owner" required />
          <input name="repositoryPath" placeholder="Path e.g. backend/api-gateway" required />
          <button type="submit">Create Repository</button>
        </form>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <h3>Repository Records</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Repository</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Alignment</th>
              <th>Evidence</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {repositories.map((repo) => (
              <tr key={repo.id}>
                <td>{repo.code}</td>
                <td>{repo.name}<br /><small>{repo.repositoryPath}</small></td>
                <td>{repo.owner}</td>
                <td>{repo.status}</td>
                <td>{repo.alignmentScore}%</td>
                <td>{repo.evidenceSubmitted ? 'Submitted' : 'Pending'}</td>
                <td>
                  <form action={updateRecoveryRepositoryAction} className="actions">
                    <input type="hidden" name="id" value={repo.id} />
                    <select name="status" defaultValue={repo.status}>
                      <option value="NOT_STARTED">NOT_STARTED</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="READY_FOR_REVIEW">READY_FOR_REVIEW</option>
                      <option value="CERTIFIED">CERTIFIED</option>
                      <option value="BLOCKED">BLOCKED</option>
                    </select>
                    <input
                      name="alignmentScore"
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={repo.alignmentScore}
                    />
                    <select name="evidenceSubmitted" defaultValue={String(repo.evidenceSubmitted)}>
                      <option value="false">Evidence Pending</option>
                      <option value="true">Evidence Submitted</option>
                    </select>
                    <button type="submit">Save</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
