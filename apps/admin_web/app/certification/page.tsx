import { apiGet, ApiResponse } from '../../lib/api';
import { requireAdminSession, canAccess } from '../../lib/auth';

type CertificationArea = {
  area: string;
  status: 'PASS' | 'PARTIAL' | 'FAIL';
  score: number;
  evidence: Record<string, unknown>;
  blockers: string[];
};

type Report = {
  generatedAt: string;
  blueprint: string;
  estimatedAlignmentPercent: number;
  productionDecision: string;
  areas: CertificationArea[];
  blockers: { area: string; blocker: string }[];
  requiredNextActions: string[];
};

async function getReport() {
  try {
    const response = await apiGet<ApiResponse<Report>>(
      '/certification/blueprint-alignment'
    );
    return response.data;
  } catch {
    return null;
  }
}

export default async function CertificationPage() {
  const session = requireAdminSession();
  if (!canAccess(session.role, 'ADMIN')) {
    return (
      <section className="header">
        <h1>Access Denied</h1>
      </section>
    );
  }

  const report = await getReport();

  return (
    <>
      <section className="header">
        <h1>Blueprint Alignment Certification</h1>
        <p>Automated production-readiness report based on live repository evidence.</p>
      </section>

      <section className="grid cols-4">
        <div className="card">
          <h3>Alignment</h3>
          <div className="statValue">{report?.estimatedAlignmentPercent ?? 0}%</div>
        </div>
        <div className="card">
          <h3>Decision</h3>
          <div className="statValue" style={{ fontSize: 18 }}>
            {report?.productionDecision || 'UNKNOWN'}
          </div>
        </div>
        <div className="card">
          <h3>Areas</h3>
          <div className="statValue">{report?.areas.length ?? 0}</div>
        </div>
        <div className="card">
          <h3>Blockers</h3>
          <div className="statValue">{report?.blockers.length ?? 0}</div>
        </div>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <h3>Capability Matrix</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Area</th>
              <th>Status</th>
              <th>Score</th>
              <th>Blockers</th>
            </tr>
          </thead>
          <tbody>
            {(report?.areas || []).map((area) => (
              <tr key={area.area}>
                <td>{area.area}</td>
                <td><span className="badge">{area.status}</span></td>
                <td>{area.score}</td>
                <td>
                  {area.blockers.length
                    ? area.blockers.map((b) => <div key={b}>{b}</div>)
                    : 'None'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <h3>Full Evidence JSON</h3>
        <pre style={{ whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(report || {}, null, 2)}
        </pre>
      </section>
    </>
  );
}
