import { apiGet, ApiResponse } from '../../../lib/api';
import { requireAdminSession, canAccess } from '../../../lib/auth';
async function getEvidence() {
 try {
 const response = await apiGet<ApiResponse<Record<string, unknown>>>(
 '/events/processing/evidence'
 );
 return response.data;
 } catch {
 return null;
 }
}
export default async function EventEvidencePage() {
    const session = requireAdminSession();
    if (!canAccess(session.role, 'ADMIN')) {
        return (
            <>
                <section className="header">
                    <h1>Access Denied</h1>
                </section>
            </>
        );
    }
    const evidence = await getEvidence();
    return (
        <>
            <section className="header">
                <h1>Event Processing Evidence Export</h1>
                <p>Use this evidence in certification submissions.</p>
            </section>
            <section className="card">
                <pre style={{ whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(evidence || {}, null, 2)}
                </pre>
            </section>
        </>
    );
}