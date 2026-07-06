import { apiGet, ApiResponse } from '../../../lib/api';
import { FlashMessage } from '../../../components/FlashMessage';
import { approveRecoveryCertificationAction } from '../../../lib/recovery-governance-actions';

type Repo = {
  id: string;
  code: string;
  name: string;
  status: string;
  certifications: {
    id: string;
    certificationType: string;
    decision: string;
    reviewer?: string;
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

export default async function RecoveryCertificationPage({
  searchParams
}: {
  searchParams: { success?: string; error?: string };
}) {
  const repositories = await getRepositories();

  return (
    <>
      <section className="header">
        <h1>Recovery Certifications</h1>
        <p>Approve or reject repository recovery certifications.</p>
      </section>

      <FlashMessage success={searchParams.success} error={searchParams.error} />

      <section className="card">
        <h3>Record Certification Decision</h3>
        <form action={approveRecoveryCertificationAction} className="grid">
          <select name="repositoryId" required>
            {repositories.map((repo) => (
              <option key={repo.id} value={repo.id}>{repo.code} — {repo.name}</option>
            ))}
          </select>
          <select name="certificationType">
            <option value="DEVELOPMENT">DEVELOPMENT</option>
            <option value="SECURITY">SECURITY</option>
            <option value="MODERATION">MODERATION</option>
            <option value="OPERATIONS">OPERATIONS</option>
            <option value="PRODUCTION">PRODUCTION</option>
          </select>
          <select name="decision">
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
          <input name="reviewer" placeholder="Reviewer" />
          <textarea name="comments" placeholder="Comments" />
          <button type="submit">Record Decision</button>
        </form>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <h3>Certification Records</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Repository</th>
              <th>Status</th>
              <th>Certification</th>
              <th>Decision</th>
              <th>Reviewer</th>
            </tr>
          </thead>
          <tbody>
            {repositories.flatMap((repo) =>
              repo.certifications.map((cert) => (
                <tr key={cert.id}>
                  <td>{repo.code}</td>
                  <td>{repo.status}</td>
                  <td>{cert.certificationType}</td>
                  <td>{cert.decision}</td>
                  <td>{cert.reviewer || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}
