import { apiGet, ApiResponse } from '../../../lib/api';
import { FlashMessage } from '../../../components/FlashMessage';
import {
  createRecoveryBlockerAction,
  updateRecoveryBlockerAction
} from '../../../lib/recovery-governance-actions';

type Repo = {
  id: string;
  code: string;
  name: string;
  blockers: {
    id: string;
    blockerCode: string;
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

export default async function RecoveryBlockersPage({
  searchParams
}: {
  searchParams: { success?: string; error?: string };
}) {
  const repositories = await getRepositories();

  return (
    <>
      <section className="header">
        <h1>Recovery Blockers</h1>
        <p>Create, track, and resolve production blockers.</p>
      </section>

      <FlashMessage success={searchParams.success} error={searchParams.error} />

      <section className="card">
        <h3>Create Blocker</h3>
        <form action={createRecoveryBlockerAction} className="grid">
          <select name="repositoryId" required>
            {repositories.map((repo) => (
              <option key={repo.id} value={repo.id}>{repo.code} — {repo.name}</option>
            ))}
          </select>
          <input name="blockerCode" placeholder="BLK-GW-001" required />
          <input name="title" placeholder="Blocker title" required />
          <textarea name="description" placeholder="Description" required />
          <select name="severity">
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
          <input name="owner" placeholder="Owner" />
          <button type="submit">Create Blocker</button>
        </form>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <h3>Blocker Records</h3>
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
              repo.blockers.map((blocker) => (
                <tr key={blocker.id}>
                  <td>{repo.code}</td>
                  <td>{blocker.blockerCode}</td>
                  <td>{blocker.title}</td>
                  <td>{blocker.severity}</td>
                  <td>{blocker.status}</td>
                  <td>
                    <form action={updateRecoveryBlockerAction} className="actions">
                      <input type="hidden" name="id" value={blocker.id} />
                      <select name="status" defaultValue={blocker.status}>
                        <option value="OPEN">OPEN</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="ACCEPTED">ACCEPTED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                      <input name="resolution" placeholder="Resolution" />
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
