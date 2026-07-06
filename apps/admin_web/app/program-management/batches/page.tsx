import { apiGet, ApiResponse } from '../../../lib/api';
import { FlashMessage } from '../../../components/FlashMessage';
import { upsertRecoveryBatchAction } from '../../../lib/recovery-governance-actions';

type Repo = {
  id: string;
  code: string;
  name: string;
  batches: {
    id: string;
    batchNumber: number;
    title: string;
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

export default async function RecoveryBatchesPage({
  searchParams
}: {
  searchParams: { success?: string; error?: string };
}) {
  const repositories = await getRepositories();

  return (
    <>
      <section className="header">
        <h1>Recovery Batch Completion</h1>
        <p>Mark Batches 39–52 as completed, failed, or not applicable per repository.</p>
      </section>

      <FlashMessage success={searchParams.success} error={searchParams.error} />

      <section className="card">
        <h3>Update Batch Completion</h3>
        <form action={upsertRecoveryBatchAction} className="grid">
          <select name="repositoryId" required>
            {repositories.map((repo) => (
              <option key={repo.id} value={repo.id}>
                {repo.code} — {repo.name}
              </option>
            ))}
          </select>
          <input name="batchNumber" type="number" min="39" max="99" placeholder="Batch number" required />
          <input name="title" placeholder="Batch title" required />
          <select name="status">
            <option value="NOT_STARTED">NOT_STARTED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="FAILED">FAILED</option>
            <option value="NOT_APPLICABLE">NOT_APPLICABLE</option>
          </select>
          <input name="evidenceIds" placeholder="Evidence IDs comma separated" />
          <textarea name="notes" placeholder="Notes" />
          <button type="submit">Save Batch Status</button>
        </form>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <h3>Batch Records</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Repository</th>
              <th>Batch</th>
              <th>Title</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {repositories.flatMap((repo) =>
              repo.batches.map((batch) => (
                <tr key={batch.id}>
                  <td>{repo.code}</td>
                  <td>{batch.batchNumber}</td>
                  <td>{batch.title}</td>
                  <td>{batch.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}
