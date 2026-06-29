import { apiGet, ApiResponse } from "../../lib/api";
type Diagnostics = {
  userId: string;
  profile?: {
    categoryScores?: Record<string, number>;
    regionScores?: Record<string, number>;
    lastUpdatedAt?: string;
  };
  recentEvents: {
    id: string;
    action: string;
    watchMs?: number;
    createdAt: string;
    video?: {
      title: string;
      category: string;
      region?: string;
    };
  }[];
};
async function getDiagnostics(userId: string) {
  try {
    const response = await apiGet<ApiResponse<Diagnostics>>(
      `/feed/diagnostics/${userId}`,
    );
    return response.data;
  } catch {
    return null;
  }
}
export default async function FeedDiagnosticsPage({
  searchParams,
}: {
  searchParams: { userId?: string };
}) {
  const userId = searchParams.userId || "demo-user";
  const diagnostics = await getDiagnostics(userId);
  const categoryScores = diagnostics?.profile?.categoryScores || {};
  return (
    <>
      <section className="header">
        <h1>User Feed Diagnostics</h1>
        <p>
          Inspect category preference learning, watch behavior, skips, likes,
          shares, and saves.
        </p>
      </section>
      <section className="card">
        <form className="actions">
          <input name="userId" defaultValue={userId} placeholder="User ID" />
          <button type="submit">Load diagnostics</button>
        </form>
      </section>
      <section className="card" style={{ marginTop: 20 }}>
        <h3>Category Preference Scores</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(categoryScores).map(([category, score]) => (
              <tr key={category}>
                <td>{category}</td>
                <td>{Number(score).toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="card" style={{ marginTop: 20 }}>
        <h3>Recent Feed Events</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Video</th>
              <th>Category</th>
              <th>Action</th>
              <th>Watch ms</th>
            </tr>
          </thead>
          <tbody>
            {(diagnostics?.recentEvents || []).map((event) => (
              <tr key={event.id}>
                <td>{new Date(event.createdAt).toLocaleString()}</td>
                <td>{event.video?.title || "-"}</td>
                <td>{event.video?.category || "-"}</td>
                <td>{event.action}</td>
                <td>{event.watchMs || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
