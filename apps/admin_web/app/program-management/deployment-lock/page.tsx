import { apiGet, ApiResponse } from '../../../lib/api';
import { FlashMessage } from '../../../components/FlashMessage';
import {
  createDeploymentLockAction,
  validateDeploymentLockAction,
  markDeploymentDeployedAction,
} from '../../../lib/deployment-lock-actions';

type DeploymentLock = {
  id: string;
  releaseVersion: string;
  evidenceBundleId: string;
  executiveDecision: string;
  authorizationSigned: boolean;
  authorizedBy?: string;
  authorizationReference?: string;
  deploymentStatus: string;
  authorizedAt?: string;
  deployedAt?: string;
};

async function getLocks() {
  try {
    const response = await apiGet<ApiResponse<DeploymentLock[]>>(
      '/production-deployment-lock'
    );
    return response.data || [];
  } catch {
    return [];
  }
}

export default async function DeploymentLockPage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string };
}) {
  const locks = await getLocks();

  return (
    <>
      <section className="header">
        <h1>Production Deployment Lock</h1>
        <p>
          Production deployment is blocked unless executive GO decision, signed authorization,
          evidence bundle ID, and release version are recorded.
        </p>
      </section>

      <FlashMessage success={searchParams.success} error={searchParams.error} />

      <section className="card">
        <h3>Create / Update Deployment Lock</h3>
        <form action={createDeploymentLockAction} className="grid">
          <input name="releaseVersion" placeholder="Release version e.g. v1.0.0" required />
          <input name="evidenceBundleId" placeholder="Executive evidence bundle ID" required />
          <select name="executiveDecision">
            <option value="NO_GO">NO_GO</option>
            <option value="GO">GO</option>
          </select>
          <select name="authorizationSigned">
            <option value="false">Authorization Not Signed</option>
            <option value="true">Authorization Signed</option>
          </select>
          <input name="authorizedBy" placeholder="Authorized by" />
          <input name="authorizationReference" placeholder="Authorization reference / document ID" />
          <textarea name="notes" placeholder="Notes" />
          <button type="submit">Save Deployment Lock</button>
        </form>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <h3>Deployment Locks</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Release</th>
              <th>Bundle</th>
              <th>Decision</th>
              <th>Signed</th>
              <th>Status</th>
              <th>Validate</th>
              <th>Mark Deployed</th>
            </tr>
          </thead>
          <tbody>
            {locks.map((lock) => (
              <tr key={lock.id}>
                <td>{lock.releaseVersion}</td>
                <td>{lock.evidenceBundleId}</td>
                <td>{lock.executiveDecision}</td>
                <td>{lock.authorizationSigned ? 'Yes' : 'No'}</td>
                <td>{lock.deploymentStatus}</td>
                <td>
                  <form action={validateDeploymentLockAction}>
                    <input type="hidden" name="releaseVersion" value={lock.releaseVersion} />
                    <button type="submit">Validate</button>
                  </form>
                </td>
                <td>
                  <form action={markDeploymentDeployedAction} className="actions">
                    <input type="hidden" name="releaseVersion" value={lock.releaseVersion} />
                    <input name="deploymentEvidenceRef" placeholder="Evidence ref" />
                    <button type="submit">Mark Deployed</button>
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
