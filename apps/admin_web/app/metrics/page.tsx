import { apiGet, ApiResponse } from "../../lib/api";
import { requireAdminSession, canAccess } from "../../lib/auth";
type MetricsEvidence = {
  generatedAt: string;
  queues: {
    moderationQueue: number;
    renderQueue: number;
  };
  content: {
    published: number;
  };
  providers: {
    failedProviderJobs: number;
    fallbackProviderJobs: number;
  };
  events: {
    failedEvents: number;
    deadLetteredEvents: number;
  };
};
async function getMetricsEvidence() {
  try {
    const response = await apiGet<ApiResponse<MetricsEvidence>>(
      "/observability/metrics-evidence",
    );
    return response.data;
  } catch {
    return null;
  }
}
export default async function MetricsPage() {
  const session = requireAdminSession();
  if (!canAccess(session.role, "ADMIN")) {
    return (
      <>
        <section className="header">
          <h1>Access Denied</h1>
          <p>Only super admins can view metrics evidence.</p>
        </section>
      </>
    );
  }
  const metrics = await getMetricsEvidence();
  return (
    <>
      <section className="header">
        <h1>Production Metrics Evidence</h1>
        <p>Prometheus-aligned operational evidence for certification.</p>
      </section>
      <section className="grid cols-4">
        <div className="card">
          <h3>Render Queue</h3>
          <div className="statValue">{metrics?.queues.renderQueue ?? 0}</div>
        </div>
        <div className="card">
          <h3>Moderation Queue</h3>
          <div className="statValue">
            {metrics?.queues.moderationQueue ?? 0}
          </div>
        </div>
        <div className="card">
          <h3>Published</h3>
          <div className="statValue">{metrics?.content.published ?? 0}</div>
        </div>
        <div className="card">
          <h3>Dead Letters</h3>
          <div className="statValue">
            {metrics?.events.deadLetteredEvents ?? 0}
          </div>
        </div>
      </section>
      <section className="card" style={{ marginTop: 20 }}>
        <h3>Provider & Event Health</h3>
        <table className="table">
          <tbody>
            <tr>
              <td>Failed Provider Jobs</td>
              <td>{metrics?.providers.failedProviderJobs ?? 0}</td>
            </tr>
            <tr>
              <td>Fallback Provider Jobs</td>
              <td>{metrics?.providers.fallbackProviderJobs ?? 0}</td>
            </tr>
            <tr>
              <td>Failed Events</td>
              <td>{metrics?.events.failedEvents ?? 0}</td>
            </tr>
            <tr>
              <td>Dead-Lettered Events</td>
              <td>{metrics?.events.deadLetteredEvents ?? 0}</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section className="card" style={{ marginTop: 20 }}>
        <h3>Evidence JSON</h3>
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {JSON.stringify(metrics || {}, null, 2)}
        </pre>
      </section>
    </>
  );
}
