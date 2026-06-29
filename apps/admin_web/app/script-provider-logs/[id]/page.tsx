import Link from "next/link";
import { apiGet, ApiResponse } from "../../../lib/api";
type ScriptProviderLogDetail = {
  id: string;
  providerName: string;
  status: string;
  fallbackUsed: boolean;
  requestPayload?: Record<string, unknown>;
  responsePayload?: Record<string, unknown>;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
  script?: {
    id: string;
    title: string;
    hook: string;
    body: string;
    cta?: string;
    qualityScore: number;
    factScore: number;
    metadata?: Record<string, unknown>;
    trend?: {
      topic: string;
      category: string;
      region?: string;
      country?: string;
    };
    videos?: {
      id: string;
      title: string;
      status: string;
      videoUrl?: string;
    }[];
  };
  trend?: {
    id: string;
    topic: string;
    category: string;
    region?: string;
    country?: string;
  };
};
async function getLog(id: string) {
  try {
    const response = await apiGet<ApiResponse<ScriptProviderLogDetail>>(
      `/script-provider-logs/${id}`,
    );
    return response.data;
  } catch {
    return null;
  }
}
function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre
      style={{
        whiteSpace: "pre-wrap",
        overflowX: "auto",
        background: "#070710",
        border: "1px solid #24243a",
        borderRadius: 12,
        padding: 16,
      }}
    >
      {JSON.stringify(value || {}, null, 2)}
    </pre>
  );
}
export default async function ScriptProviderLogDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const log = await getLog(params.id);
  if (!log) {
    return (
      <>
        <section className="header">
          <h1>Script Provider Log Not Found</h1>
          <p>The requested provider log could not be loaded.</p>
        </section>
        <Link href="/script-provider-logs">Back to logs</Link>
      </>
    );
  }
  return (
    <>
      <section className="header">
        <h1>Script Provider Log Detail</h1>
        <p>
          Full request, response, fallback, and generated script audit trail.
        </p>
      </section>
      <section className="grid cols-4">
        <div className="card">
          <h3>Provider</h3>
          <div className="statValue">{log.providerName}</div>
        </div>
        <div className="card">
          <h3>Status</h3>
          <div className="statValue">{log.status}</div>
        </div>
        <div className="card">
          <h3>Fallback</h3>
          <div className="statValue">{log.fallbackUsed ? "Yes" : "No"}</div>
        </div>
        <div className="card">
          <h3>Quality</h3>
          <div className="statValue">{log.script?.qualityScore ?? "-"}</div>
        </div>
      </section>
      <section className="card" style={{ marginTop: 20 }}>
        <h3>Trend</h3>
        <p>
          <strong>Topic:</strong>{" "}
          {log.trend?.topic || log.script?.trend?.topic || "-"}
        </p>
        <p>
          <strong>Category:</strong>{" "}
          {log.trend?.category || log.script?.trend?.category || "-"}
        </p>
        <p>
          <strong>Region:</strong>{" "}
          {log.trend?.region || log.script?.trend?.region || "-"}
        </p>
      </section>
      <section className="card" style={{ marginTop: 20 }}>
        <h3>Generated Script</h3>
        <p>
          <strong>Title:</strong> {log.script?.title || "-"}
        </p>
        <p>
          <strong>Hook:</strong> {log.script?.hook || "-"}
        </p>
        <p>
          <strong>Body:</strong> {log.script?.body || "-"}
        </p>
        <p>
          <strong>CTA:</strong> {log.script?.cta || "-"}
        </p>
        <p>
          <strong>Fact Score:</strong> {log.script?.factScore ?? "-"}
        </p>
      </section>
      <section className="card" style={{ marginTop: 20 }}>
        <h3>Request Payload</h3>
        <JsonBlock value={log.requestPayload} />
      </section>
      <section className="card" style={{ marginTop: 20 }}>
        <h3>Response Payload</h3>
        <JsonBlock value={log.responsePayload} />
      </section>
      {log.errorMessage && (
        <section className="card" style={{ marginTop: 20 }}>
          <h3>Error</h3>
          <p>{log.errorMessage}</p>
        </section>
      )}
      <section className="card" style={{ marginTop: 20 }}>
        <Link href="/script-provider-logs">Back to script provider logs</Link>
      </section>
    </>
  );
}
