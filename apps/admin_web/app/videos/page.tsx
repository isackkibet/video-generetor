import { apiGet, ApiResponse } from "../../lib/api";
// ✅ Added: FlashMessage and pipeline action imports
import { FlashMessage } from "../../components/FlashMessage";
import {
  createPendingRenderJobsAction,
  renderPendingVideosAction,
} from "../../lib/pipeline-actions";

type Video = {
  id: string;
  title: string;
  category: string;
  status: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  region?: string;
  country?: string;
  durationSeconds?: number;
  score?: {
    viralProbability: number;
    engagementScore: number;
    watchTimeScore: number;
    shareScore: number;
    commentScore: number;
    qualityScore: number;
  };
  renderMetadata?: {
    ttsProvider?: string;
    avatarProvider?: string;
    renderProvider?: string;
    fallbackUsed: boolean;
    failureReason?: string;
  };
};

async function getVideos() {
  try {
    const response = await apiGet<ApiResponse<Video[]>>(
      "/render/videos?take=50",
    );
    return response.data || [];
  } catch {
    return [];
  }
}

// ✅ Updated: Added searchParams prop
export default async function VideosPage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string };
}) {
  const videos = await getVideos();

  return (
    <>
      <section className="header">
        <h1>Seed Video Library</h1>
        <p>
          Inspect render status, viral score, provider metadata, and fallback
          status.
        </p>
      </section>

      {/* ✅ Added: FlashMessage for success/error feedback */}
      <FlashMessage success={searchParams.success} error={searchParams.error} />

      <div className="actions">
        {/* ✅ Updated: Using pipeline actions instead of inline actions */}
        <form action={createPendingRenderJobsAction}>
          <button type="submit">Create pending jobs</button>
        </form>
        <form action={renderPendingVideosAction}>
          <button type="submit" className="secondary">
            Render pending videos
          </button>
        </form>
      </div>

      <section className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Viral</th>
              <th>Engagement</th>
              <th>Quality</th>
              <th>Provider</th>
              <th>Fallback</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr key={video.id}>
                <td>{video.title}</td>
                <td>
                  <span className="badge">{video.category}</span>
                </td>
                <td>{video.status}</td>
                <td>{video.score?.viralProbability ?? "-"}</td>
                <td>{video.score?.engagementScore ?? "-"}</td>
                <td>{video.score?.qualityScore ?? "-"}</td>
                <td>{video.renderMetadata?.renderProvider || "-"}</td>
                <td>{video.renderMetadata?.fallbackUsed ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
