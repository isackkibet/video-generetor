import Link from "next/link";
import "./styles.css";
import { getAdminSession } from "../lib/auth";

export const metadata = {
  title: "YohPal Live AI Factory Admin",
  description: "Admin dashboard for YohPal Live AI seed content factory",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = getAdminSession();

  return (
    <html lang="en">
      <body>
        <div className="shell">
          <aside className="sidebar">
            <div className="brand">
              <div className="brandMark">YL</div>
              <div>
                <strong>YohPal Live</strong>
                <span>AI Factory Admin</span>
              </div>
            </div>

            {session && (
              <div className="card" style={{ marginBottom: 20 }}>
                <strong>{session.name}</strong>
                <br />
                <span>{session.role}</span>
              </div>
            )}

            {session && (
              <form
                action="/api/auth/logout"
                method="post"
                style={{ marginBottom: 20 }}
              >
                <button type="submit" className="secondary">
                  Logout
                </button>
              </form>
            )}

            <nav>
              <Link href="/">Dashboard</Link>
              <Link href="/trends">Trends</Link>
              <Link href="/scripts">Scripts</Link>
              <Link href="/videos">Videos</Link>
              <Link href="/moderation">Moderation</Link>
              <Link href="/feed-diagnostics">Feed Diagnostics</Link>
              <Link href="/provider-jobs">Provider Jobs</Link>
              <Link href="/script-provider-logs">Script Provider Logs</Link>
              <Link href="/admin-users">Admin Users</Link>
              <Link href="/admin-audit-logs">Admin Audit Logs</Link>
              <Link href="/observability">Observability</Link>
              <Link href="/events">Event Processing</Link>
              <Link href="/events/evidence">Event Evidence</Link>
              <Link href="/metrics">Metrics Evidence</Link>
              <Link href="/backup">Backup Evidence</Link>
              {/* ✅ Added: Batch 48 - Blueprint Certification */}
              <Link href="/certification">Blueprint Certification</Link>
              <Link href="/release-gate">Release Gate</Link>
            </nav>
          </aside>
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
