import { apiGet, ApiResponse } from "../../lib/api";
// ✅ Added: FlashMessage and pipeline action imports
import { FlashMessage } from "../../components/FlashMessage";
import { generatePendingScriptsAction } from "../../lib/pipeline-actions";

type Script = {
  id: string;
  title: string;
  hook: string;
  language: string;
  qualityScore: number;
  factScore: number;
  createdAt: string;
  metadata?: {
    provider?: {
      name?: string;
      fallbackUsed?: boolean;
    };
  };
  providerLogs?: {
    id: string;
    providerName: string;
    status: string;
    fallbackUsed: boolean;
    errorMessage?: string;
  }[];
  trend?: {
    topic: string;
    category: string;
  };
};

async function getScripts() {
  try {
    const response = await apiGet<ApiResponse<Script[]>>("/scripts?take=50");
    return response.data || [];
  } catch {
    return [];
  }
}

// ✅ Updated: Added searchParams prop
export default async function ScriptsPage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string };
}) {
  const scripts = await getScripts();

  return (
    <>
      <section className="header">
        <h1>AI Script Factory</h1>
        <p>Generate scripts and inspect LLM provider audit status.</p>
      </section>

      {/* ✅ Added: FlashMessage for success/error feedback */}
      <FlashMessage success={searchParams.success} error={searchParams.error} />

      {/* ✅ Updated: Using pipeline action instead of inline action */}
      <form action={generatePendingScriptsAction} className="actions">
        <button type="submit">Generate pending scripts</button>
      </form>

      <section className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Provider</th>
              <th>Status</th>
              <th>Fallback</th>
              <th>Quality</th>
              <th>Fact</th>
            </tr>
          </thead>
          <tbody>
            {scripts.map((script) => {
              const latestLog = script.providerLogs?.[0];
              return (
                <tr key={script.id}>
                  <td>{script.title}</td>
                  <td>
                    <span className="badge">
                      {script.trend?.category || "seed"}
                    </span>
                  </td>
                  <td>
                    {script.metadata?.provider?.name ||
                      latestLog?.providerName ||
                      "-"}
                  </td>
                  <td>{latestLog?.status || "-"}</td>
                  <td>
                    {script.metadata?.provider?.fallbackUsed ||
                    latestLog?.fallbackUsed
                      ? "Yes"
                      : "No"}
                  </td>
                  <td>{script.qualityScore}</td>
                  <td>{script.factScore}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
}
