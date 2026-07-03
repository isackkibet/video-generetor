import { apiGet, apiPost, ApiResponse } from "../../lib/api";
import { requireAdminSession, canAccess } from "../../lib/auth";
type EventLog = {
  id: string;
  idempotencyKey: string;
  topic: string;
  status: string;
  attempts: number;
  errorMessage?: string;
  updatedAt: string;
};
type EventSummary = {
  total: number;
  running: number;
  success: number;
  failed: number;
  retried: number;
  deadLettered: number;
};
async function getSummary() {
  try {
    const response = await apiGet<ApiResponse<EventSummary>>(
      "/events/processing/summary",
    );
    return response.data;
  } catch {
    return {
      total: 0,
      running: 0,
      success: 0,
      failed: 0,
      retried: 0,
      deadLettered: 0,
    };
  }
}
async function getEvents(searchParams: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  if (!query.has("take")) query.set("take", "100");
  try {
    const response = await apiGet<ApiResponse<EventLog[]>>(
      `/events/processing?${query.toString()}`,
    );
    return response.data || [];
  } catch {
    return [];
  }
}
async function retryEvent(formData: FormData) {
  "use server";
  const idempotencyKey = String(formData.get("idempotencyKey") || "");
  await apiPost("/events/processing/retry", {
    idempotencyKey,
  });
}
export default async function EventsPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const session = requireAdminSession();
  if (!canAccess(session.role, "ADMIN")) {
    return (
      <>
        <section className="header">
          <h1>Access Denied</h1>
          <p>Only super admins can view event processing logs.</p>
        </section>
      </>
    );
  }
  const [summary, events] = await Promise.all([
    getSummary(),
    getEvents(searchParams),
  ]);
  return (
    <>
      <section className="header">
        <h1>Event Processing & Dead Letter Dashboard</h1>
        <p>
          Inspect worker events, failed processing, retries, and dead-letter
          records.
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
          <h3>Dead Letter</h3>
          <div className="statValue">{summary.deadLettered}</div>
        </div>
      </section>
      <section className="card" style={{ marginTop: 20 }}>
        <h3>Filters</h3>
        <form className="actions">
          <input
            name="topic"
            placeholder="Topic"
            defaultValue={searchParams.topic || ""}
          />
          <select name="status" defaultValue={searchParams.status || ""}>
            <option value="">All statuses</option>
            <option value="RUNNING">Running</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="RETRIED">Retried</option>
            <option value="DEAD_LETTERED">Dead Lettered</option>
          </select>
          <input
            name="take"
            type="number"
            defaultValue={searchParams.take || "100"}
          />
          <button type="submit">Apply</button>
        </form>
      </section>
      <section className="card" style={{ marginTop: 20 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Updated</th>
              <th>Topic</th>
              <th>Status</th>
              <th>Attempts</th>
              <th>Error</th>
              <th>Retry</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{new Date(event.updatedAt).toLocaleString()}</td>
                <td>
                  <span className="badge">{event.topic}</span>
                </td>
                <td>{event.status}</td>
                <td>{event.attempts}</td>
                <td>{event.errorMessage || "-"}</td>
                <td>
                  {event.status === "FAILED" ||
                  event.status === "DEAD_LETTERED" ? (
                    <form action={retryEvent}>
                      <input
                        type="hidden"
                        name="idempotencyKey"
                        value={event.idempotencyKey}
                      />
                      <button type="submit">Retry</button>
                    </form>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
