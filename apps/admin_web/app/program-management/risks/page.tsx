import { apiGet, ApiResponse } from '../../../lib/api';
import { FlashMessage } from '../../../components/FlashMessage';
import {
  createRecoveryRiskAction,
  updateRecoveryRiskAction
} from '../../../lib/recovery-governance-actions';

type Repo = {
  id: string;
  code: string;
  name: string;
  risks: {
    id: string;
    riskCode: string;
    title: string;
    severity: string;
    status: string;
  }[];
};

async function getRepositories() {
  try {
    const response = await apiGet<ApiResponse<Repo[]>>('/recovery-governance/repositories');
    return response.data || [];
  } catch {
    return [];
  }
}

export default async function RecoveryRisksPage({
  searchParams
}: {
  searchParams: { success?: string; error?: string };
}) {
  const repositories = await getRepositories();

  return (
    <>
      <section className="header">
        <h1>Recovery Risks</h1>
        <p>Create, mitigate, accept, or resolve recovery risks.</p>
      </section>

      <FlashMessage success={searchParams.success} error={searchParams.error} />

      <section className="card">
        <h3>Create Risk</h3>
        <form action={createRecoveryRiskAction} className="grid">
          <select name="repositoryId" required>
            {repositories.map((repo) => (
              <option key={repo.id} value={repo.id}>{repo.code} — {repo.name}</option>
            ))}
          </select>
          <input name="riskCode" placeholder="RSK-GW-001" required />
          <input name="title" placeholder="Risk title" required />
          <textarea name="description" placeholder="Description" required />
          <select name="severity">
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
          <textarea name="mitigation" placeholder="Mitigation" />
          <input name="owner" placeholder="Owner" />
          <button type="submit">Create Risk</button>
        </form>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <h3>Risk Records</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Repo</th>
              <th>Code</th>
              <th>Title</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {repositories.flatMap((repo) =>
              repo.risks.map((risk) => (
                <tr key={risk.id}>
                  <td>{repo.code}</td>
                  <td>{risk.riskCode}</td>
                  <td>{risk.title}</td>
                  <td>{risk.severity}</td>
                  <td>{risk.status}</td>
                  <td>
                    <form action={updateRecoveryRiskAction} className="actions">
                      <input type="hidden" name="id" value={risk.id} />
                      <select name="status" defaultValue={risk.status}>
                        <option value="OPEN">OPEN</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="ACCEPTED">ACCEPTED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                      <input name="resolution" placeholder="Resolution / mitigation update" />
                      <button type="submit">Save</button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}
