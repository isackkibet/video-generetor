import Link from "next/link";
import { apiGet, ApiResponse } from "../../lib/api";
type ScriptProviderLog = {
  id: string;
  providerName: string;
  status: string;
  fallbackUsed: boolean;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
  script?: {
    id: string;
    title: string;
    qualityScore: number;
    factScore: number;
  };
  trend?: {
    id: string;
    topic: string;
    category: string;
    region?: string;
    country?: string;
  };
};
type ScriptProviderSummary = {
  total: number;
  success: number;
  failed: number;
  fallback: number;
  running: number;
};
async function getLogs(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string" && value.length > 0) {
      query.set(key, value);
    }
  }
  if (!query.has("take")) {
    query.set("take", "100");
  }
  try {
    const response = await apiGet<ApiResponse<ScriptProviderLog[]>>(
      `/script-provider-logs?${query.toString()}`,
    );
    return response.data || [];
  } catch {
    return [];
  }
}
async function getSummary() {
  try {
    const response = await apiGet<ApiResponse<ScriptProviderSummary>>(
      "/script-provider-logs/summary",
    );
    return response.data;
  } catch {
    return {
      total: 0,
      success: 0,
      failed: 0,
      fallback: 0,
      running: 0,
    };
  }
}
export default async function ScriptProviderLogsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const [logs, summary] = await Promise.all([
    getLogs(searchParams),
    getSummary(),
  ]);
  return (
    <>
      <section className="header">
        <h1>Script Provider Logs</h1>
        <p>
          Audit LLM script generation provider calls, failures, fallback usage,
          and script-level results.
        </p>
      </section>
      <section className="grid cols-4">
        <div className="card">
          <h3>Total</h3>
          <div className="statValue">{summary.total}</div>
        </div>
        <div className="card">
          <h3>Success</h3>
          <div className="statValue">{summary.success}</div>
        </div>
        <div className="card">
          <h3>Failed</h3>
          <div className="statValue">{summary.failed}</div>
        </div>
        <div className="card">
          <h3>Fallback</h3>
          <div className="statValue">{summary.fallback}</div>
        </div>
      </section>
      <section className="card" style={{ marginTop: 20 }}>
        <h3>Filters</h3>
        <form className="actions">
          <select
            name="status"
            defaultValue={(searchParams.status as string) || ""}
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="RUNNING">Running</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="FALLBACK_USED">Fallback Used</option>
          </select>
          <select
            name="fallbackUsed"
            defaultValue={(searchParams.fallbackUsed as string) || ""}
          >
            <option value="">Fallback any</option>
            <option value="true">Fallback only</option>
            <option value="false">No fallback</option>
          </select>
          <input
            name="providerName"
            placeholder="Provider name"
            defaultValue={(searchParams.providerName as string) || ""}
          />
          <input
            name="scriptId"
            placeholder="Script ID"
            defaultValue={(searchParams.scriptId as string) || ""}
          />
          <button type="submit">Apply filters</button>
        </form>
      </section>
      <section className="card" style={{ marginTop: 20 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Started</th>
              <th>Provider</th>
              <th>Status</th>
              <th>Fallback</th>
              <th>Trend</th>
              <th>Script</th>
              <th>Quality</th>
              <th>Fact</th>
              <th>Error</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.startedAt).toLocaleString()}</td>
                <td>{log.providerName}</td>
                <td>{log.status}</td>
                <td>{log.fallbackUsed ? "Yes" : "No"}</td>
                <td>
                  <span className="badge">
                    {log.trend?.category || "unknown"}
                  </span>
                  <br />
                  {log.trend?.topic || "-"}
                </td>
                <td>{log.script?.title || "-"}</td>
                <td>{log.script?.qualityScore ?? "-"}</td>
                <td>{log.script?.factScore ?? "-"}</td>
                <td>{log.errorMessage || "-"}</td>
                <td>
                  <Link href={`/script-provider-logs/${log.id}`}>Open</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
