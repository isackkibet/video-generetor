import { FlashMessage } from '../../../components/FlashMessage';
import { recordExecutiveApprovalAction } from '../../../lib/recovery-governance-actions';

export default async function RecoveryExecutiveApprovalPage({
  searchParams
}: {
  searchParams: { success?: string; error?: string };
}) {
  return (
    <>
      <section className="header">
        <h1>Executive Recovery Approval</h1>
        <p>Record executive approval or rejection for production certification progression.</p>
      </section>

      <FlashMessage success={searchParams.success} error={searchParams.error} />

      <section className="card">
        <h3>Record Executive Decision</h3>
        <form action={recordExecutiveApprovalAction} className="grid">
          <input name="releaseVersion" placeholder="Release version e.g. v1.0.0-rc1" required />
          <select name="decision">
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
          <input name="approver" placeholder="Approver name" />
          <textarea name="comments" placeholder="Comments" />
          <button type="submit">Record Executive Decision</button>
        </form>
      </section>
    </>
  );
}
