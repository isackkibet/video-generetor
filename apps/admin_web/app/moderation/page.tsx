import { apiGet, apiPost, ApiResponse } from '../../lib/api';
type ModerationLog = {
 id: string;
 action: string;
 reason?: string;
 score: number;
 providerName?: string;
 providerAction?: string;
 fallbackUsed?: boolean;
 createdAt: string;
 video?: {
 id: string;
 title: string;
 category: string;
 status: string;
 };
};
async function getModerationQueue() {
 try {
 const response = await apiGet<ApiResponse<ModerationLog[]>>(
 '/moderation/queue?take=50'
 );
 return response.data || [];
 } catch {
 return [];
 }
}
export default async function ModerationPage() {
  const queue = await getModerationQueue();
  async function moderatePending() {
    'use server';
    await apiPost('/moderation/videos/moderate-pending?take=20');
  }
  async function publishApproved() {
    'use server';
    await apiPost('/moderation/videos/publish-approved?take=20');
  }
  return (
    <>
      <section className="header">
        <h1>Moderation Center</h1>
        <p>Review provider decisions, fallback use, safety score, and publish status.</p>
      </section>
      <div className="actions">
        <form action={moderatePending}>
          <button type="submit">Moderate pending</button>
        </form>
        <form action={publishApproved}>
          <button type="submit" className="secondary">Publish approved</button>
        </form>
      </div>
      <section className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Video</th>
              <th>Category</th>
              <th>Action</th>
              <th>Provider</th>
              <th>Fallback</th>
              <th>Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((log) => (
              <tr key={log.id}>
                <td>{log.video?.title || 'Unknown video'}</td>
                <td>
                  <span className="badge">
                    {log.video?.category || 'unknown'}
                  </span>
                </td>
                <td>{log.action}</td>
                <td>{log.providerName || '-'}</td>
                <td>{log.fallbackUsed ? 'Yes' : 'No'}</td>
                <td>{log.score}</td>
                <td>{log.video?.status || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}