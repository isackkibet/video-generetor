import { apiGet, ApiResponse } from "../../lib/api";
// ✅ Added: FlashMessage and pipeline action imports
import { FlashMessage } from "../../components/FlashMessage";
import {
  moderatePendingVideosAction,
  publishApprovedVideosAction,
} from "../../lib/pipeline-actions";

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
      "/moderation/queue?take=50",
    );
    return response.data || [];
  } catch {
    return [];
  }
}

// ✅ Updated: Added searchParams prop
export default async function ModerationPage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string };
}) {
  const queue = await getModerationQueue();

  return (
    <>
      <section className="header">
        <h1>Moderation Center</h1>
        <p>
          Review provider decisions, fallback use, safety score, and publish
          status.
        </p>
      </section>

      {/* ✅ Added: FlashMessage for success/error feedback */}
      <FlashMessage success={searchParams.success} error={searchParams.error} />

      <div className="actions">
        {/* ✅ Updated: Using pipeline actions instead of inline actions */}
        <form action={moderatePendingVideosAction}>
          <button type="submit">Moderate pending</button>
        </form>
        <form action={publishApprovedVideosAction}>
          <button type="submit" className="secondary">
            Publish approved
          </button>
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
                <td>{log.video?.title || "Unknown video"}</td>
                <td>
                  <span className="badge">
                    {log.video?.category || "unknown"}
                  </span>
                </td>
                <td>{log.action}</td>
                <td>{log.providerName || "-"}</td>
                <td>{log.fallbackUsed ? "Yes" : "No"}</td>
                <td>{log.score}</td>
                <td>{log.video?.status || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
