import { apiGet, ApiResponse } from "../../lib/api";
type ServiceStatus = {
  service: string;
  status: string;
  timestamp: string;
  services: {
    name: string;
    status: string;
    latencyMs: number;
    error?: string;
  }[];
};
type ProviderFailures = {
  providerJobs: {
    total: number;
    failed: number;
    fallback: number;
  };
  scriptProviderLogs: {
    total: number;
    failed: number;
    fallback: number;
  };
};
type PipelineSummary = {
  trends: number;
  scripts: number;
  videos: {
    draft: number;
    scripted: number;
    rendering: number;
    moderation: number;
    approved: number;
    published: number;
    rejected: number;
    failed: number;
  };
};
async function getServiceStatus() {
  try {
    return await apiGet<ServiceStatus>("/observability/services");
  } catch {
    return null;
  }
}
async function getProviderFailures() {
  try {
    const response = await apiGet<ApiResponse<ProviderFailures>>(
      "/observability/provider-failures",
    );
    return response.data;
  } catch {
    return null;
  }
}
async function getPipelineSummary() {
  try {
    const response = await apiGet<ApiResponse<PipelineSummary>>(
      "/observability/pipeline-summary",
    );
    return response.data;
  } catch {
    return null;
  }
}
export default async function ObservabilityPage() {
  const [serviceStatus, providerFailures, pipeline] = await Promise.all([
    getServiceStatus(),
    getProviderFailures(),
    getPipelineSummary(),
  ]);
  return (
    <>
      <section className="header">
        <h1>Production Observability</h1>
        <p>
          Monitor service health, provider failures, fallback usage, and content
          pipeline status.
        </p>
      </section>
      <section className="grid cols-4">
        <div className="card">
          <h3>Gateway</h3>
          <div className="statValue">{serviceStatus?.status || "down"}</div>
        </div>
        <div className="card">
          <h3>Provider Failures</h3>
          <div className="statValue">
            {(providerFailures?.providerJobs.failed || 0) +
              (providerFailures?.scriptProviderLogs.failed || 0)}
          </div>
        </div>
        <div className="card">
          <h3>Fallback Used</h3>
          <div className="statValue">
            {(providerFailures?.providerJobs.fallback || 0) +
              (providerFailures?.scriptProviderLogs.fallback || 0)}
          </div>
        </div>
        <div className="card">
          <h3>Published</h3>
          <div className="statValue">{pipeline?.videos.published || 0}</div>
        </div>
      </section>
      <section className="card" style={{ marginTop: 20 }}>
        <h3>Service Status</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Status</th>
              <th>Latency</th>
              <th>Error</th>
            </tr>
          </thead>
          <tbody>
            {(serviceStatus?.services || []).map((service) => (
              <tr key={service.name}>
                <td>{service.name}</td>
                <td>
                  <span className="badge">{service.status}</span>
                </td>
                <td>{service.latencyMs} ms</td>
                <td>{service.error || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="card" style={{ marginTop: 20 }}>
        <h3>Content Pipeline</h3>
        <table className="table">
          <tbody>
            <tr>
              <td>Trends</td>
              <td>{pipeline?.trends || 0}</td>
            </tr>
            <tr>
              <td>Scripts</td>
              <td>{pipeline?.scripts || 0}</td>
            </tr>
            <tr>
              <td>Draft Videos</td>
              <td>{pipeline?.videos.draft || 0}</td>
            </tr>
            <tr>
              <td>Scripted Videos</td>
              <td>{pipeline?.videos.scripted || 0}</td>
            </tr>
            <tr>
              <td>Rendering Videos</td>
              <td>{pipeline?.videos.rendering || 0}</td>
            </tr>
            <tr>
              <td>Moderation Videos</td>
              <td>{pipeline?.videos.moderation || 0}</td>
            </tr>
            <tr>
              <td>Approved Videos</td>
              <td>{pipeline?.videos.approved || 0}</td>
            </tr>
            <tr>
              <td>Published Videos</td>
              <td>{pipeline?.videos.published || 0}</td>
            </tr>
            <tr>
              <td>Rejected Videos</td>
              <td>{pipeline?.videos.rejected || 0}</td>
            </tr>
            <tr>
              <td>Failed Videos</td>
              <td>{pipeline?.videos.failed || 0}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </>
  );
}
