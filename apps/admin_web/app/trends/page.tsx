import { apiGet, ApiResponse } from "../../lib/api";
// ✅ Added: FlashMessage and pipeline action imports
import { FlashMessage } from "../../components/FlashMessage";
import { discoverSeedTrendsAction } from "../../lib/pipeline-actions";

type Trend = {
  id: string;
  topic: string;
  category: string;
  region?: string;
  country?: string;
  score: number;
  growthRate: number;
  source: string;
  createdAt: string;
};

async function getTrends() {
  try {
    const response = await apiGet<ApiResponse<Trend[]>>("/trends?take=50");
    return response.data || [];
  } catch {
    return [];
  }
}

// ✅ Updated: Added searchParams prop
export default async function TrendsPage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string };
}) {
  const trends = await getTrends();

  return (
    <>
      <section className="header">
        <h1>Trend Command Center</h1>
        <p>
          Discover and review topics before they become YohPal Live seed
          scripts.
        </p>
      </section>

      {/* ✅ Added: FlashMessage for success/error feedback */}
      <FlashMessage success={searchParams.success} error={searchParams.error} />

      {/* ✅ Updated: Using pipeline action instead of inline action */}
      <form action={discoverSeedTrendsAction} className="actions">
        <button type="submit">Discover seed trends</button>
      </form>

      <section className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Topic</th>
              <th>Category</th>
              <th>Region</th>
              <th>Score</th>
              <th>Growth</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {trends.map((trend) => (
              <tr key={trend.id}>
                <td>{trend.topic}</td>
                <td>
                  <span className="badge">{trend.category}</span>
                </td>
                <td>{trend.region || trend.country || "Global"}</td>
                <td>{trend.score}</td>
                <td>{trend.growthRate}</td>
                <td>{trend.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
