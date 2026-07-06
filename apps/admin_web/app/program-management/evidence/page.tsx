import { apiGet, ApiResponse } from '../../../lib/api';
import { FlashMessage } from '../../../components/FlashMessage';
import {
  submitRecoveryEvidenceAction,
  acceptRecoveryEvidenceAction
} from '../../../lib/recovery-governance-actions';

type Repo = {
  id: string;
  code: string;
  name: string;
  evidence: {
    id: string;
    evidenceCode: string;
    category: string;
    title: string;
    accepted: boolean;
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

export default async function RecoveryEvidencePage({
  searchParams
}: {
  searchParams: { success?: string; error?: string };
}) {
  const repositories = await getRepositories();

  return (
    <>
      <section className="header">
        <h1>Recovery Evidence</h1>
        <p>Submit and accept recovery evidence.</p>
      </section>

      <FlashMessage success={searchParams.success} error={searchParams.error} />

      <section className="card">
        <h3>Submit Evidence</h3>
        <form action={submitRecoveryEvidenceAction} className="grid">
          <select name="repositoryId" required>
            {repositories.map((repo) => (
              <option key={repo.id} value={repo.id}>{repo.code} — {repo.name}</option>
            ))}
          </select>
          <input name="evidenceCode" placeholder="YL-GW-API-20260701-001" required />
          <select name="category">
            <option value="TEST">TEST</option>
            <option value="API">API</option>
            <option value="LOG">LOG</option>
            <option value="SCREENSHOT">SCREENSHOT</option>
            <option value="METRICS">METRICS</option>
            <option value="BACKUP">BACKUP</option>
            <option value="CERT">CERT</option>
            <option value="DEPLOY">DEPLOY</option>
            <option value="SECURITY">SECURITY</option>
            <option value="OTHER">OTHER</option>
          </select>
          <input name="title" placeholder="Evidence title" required />
          <textarea name="description" placeholder="Description" />
          <input name="storageUrl" placeholder="Storage URL" />
          <input name="submittedBy" placeholder="Submitted by" />
          <button type="submit">Submit Evidence</button>
        </form>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <h3>Evidence Records</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Repo</th>
              <th>Code</th>
              <th>Title</th>
              <th>Category</th>
              <th>Accepted</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {repositories.flatMap((repo) =>
              repo.evidence.map((item) => (
                <tr key={item.id}>
                  <td>{repo.code}</td>
                  <td>{item.evidenceCode}</td>
                  <td>{item.title}</td>
                  <td>{item.category}</td>
                  <td>{item.accepted ? 'Yes' : 'No'}</td>
                  <td>
                    {!item.accepted && (
                      <form action={acceptRecoveryEvidenceAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <button type="submit">Accept</button>
                      </form>
                    )}
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
