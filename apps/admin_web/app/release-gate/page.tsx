import { apiGet, ApiResponse } from '../../lib/api';
import { requireAdminSession, canAccess } from '../../lib/auth';

type ReleaseGate = {
  generatedAt: string;
  decision: 'GO' | 'NO-GO';
  minimumAlignmentRequired: number;
  actualAlignment: number;
  blockerCount: number;
  productionDecision: string;
  blockers: { area: string; blocker: string }[];
};

async function getReleaseGate() {
  try {
    const response = await apiGet<ApiResponse<ReleaseGate>>(
      '/certification/release-gate'
    );
    return response.data;
  } catch {
    return null;
  }
}

export default async function ReleaseGatePage() {
  const session = requireAdminSession();
  if (!canAccess(session.role, 'ADMIN')) {
    return (
      <section className="header">
        <h1>Access Denied</h1>
      </section>
    );
  }

  const gate = await getReleaseGate();

  return (
    <>
      <section className="header">
        <h1>Production GO / NO-GO Release Gate</h1>
        <p>Final automated release gate before executive production authorization.</p>
      </section>

      <section className="grid cols-4">
        <div className="card">
          <h3>Decision</h3>
          <div className="statValue">{gate?.decision || 'UNKNOWN'}</div>
        </div>
        <div className="card">
          <h3>Alignment</h3>
          <div className="statValue">{gate?.actualAlignment ?? 0}%</div>
        </div>
        <div className="card">
          <h3>Required</h3>
          <div className="statValue">{gate?.minimumAlignmentRequired ?? 90}%</div>
        </div>
        <div className="card">
          <h3>Blockers</h3>
          <div className="statValue">{gate?.blockerCount ?? 0}</div>
        </div>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <h3>Production Decision</h3>
        <p>{gate?.productionDecision || 'UNKNOWN'}</p>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <h3>Remaining Blockers</h3>
        {gate?.blockers?.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Area</th>
                <th>Blocker</th>
              </tr>
            </thead>
            <tbody>
              {gate.blockers.map((item) => (
                <tr key={`${item.area}-${item.blocker}`}>
                  <td>{item.area}</td>
                  <td>{item.blocker}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No blockers.</p>
        )}
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <h3>Rule</h3>
        <p>
          Production is blocked unless alignment is at least 90%, no blockers remain,
          and executive authorization is granted.
        </p>
      </section>
    </>
  );
}
