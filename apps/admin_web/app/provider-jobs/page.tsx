import { apiGet, ApiResponse } from "../../lib/api";
// ✅ Added: Auth imports
import { requireAdminSession, canAccess } from "../../lib/auth";

type ProviderJob = {
  id: string;
  videoId?: string;
  jobType: string;
  providerName: string;
  status: string;
  errorMessage?: string;
  fallbackUsed: boolean;
  startedAt: string;
  completedAt?: string;
  video?: {
    id: string;
    title: string;
    category: string;
    status: string;
  };
};

type ProviderSummary = {
  total: number;
  success: number;
  failed: number;
  fallback: number;
  running: number;
};

async function getProviderJobs(
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
    const response = await apiGet<ApiResponse<ProviderJob[]>>(
      `/provider-jobs?${query.toString()}`,
    );
    return response.data || [];
  } catch {
    return [];
  }
}

async function getSummary() {
  try {
    const response = await apiGet<ApiResponse<ProviderSummary>>(
      "/provider-jobs/summary",
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

export default async function ProviderJobsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  // ✅ Added: Admin access check
  const session = requireAdminSession();
  if (!canAccess(session.role, "ADMIN")) {
    return (
      <>
        <section className="header">
          <h1>Access Denied</h1>
          <p>Only super admins can view provider job audit logs.</p>
        </section>
      </>
    );
  }

  const [jobs, summary] = await Promise.all([
    getProviderJobs(searchParams),
    getSummary(),
  ]);

  return (
    <>
      <section className="header">
        <h1>Provider Job Audit Trail</h1>
        <p>
          Inspect AI provider calls, failures, fallback usage, and
          render/moderation audit history.
        </p>
      </section>

      <section className="grid cols-4">
        <div className="card">
          <h3>Total Jobs</h3>
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
            name="jobType"
            defaultValue={(searchParams.jobType as string) || ""}
          >
            <option value="">All job types</option>
            <option value="LLM_SCRIPT">LLM Script</option>
            <option value="TTS">TTS</option>
            <option value="AVATAR_VIDEO">Avatar Video</option>
            <option value="VIDEO_COMPOSITE">Video Composite</option>
            <option value="MODERATION">Moderation</option>
          </select>

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

          <button type="submit">Apply filters</button>
        </form>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Started</th>
              <th>Job Type</th>
              <th>Provider</th>
              <th>Status</th>
              <th>Fallback</th>
              <th>Video</th>
              <th>Error</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>{new Date(job.startedAt).toLocaleString()}</td>
                <td>
                  <span className="badge">{job.jobType}</span>
                </td>
                <td>{job.providerName}</td>
                <td>{job.status}</td>
                <td>{job.fallbackUsed ? "Yes" : "No"}</td>
                <td>{job.video?.title || "-"}</td>
                <td>{job.errorMessage || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
