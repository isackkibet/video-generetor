export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <main style={{ maxWidth: 480, margin: "80px auto", padding: 24 }}>
      <section className="card">
        <h1>YohPal Live Admin Login</h1>
        <p>
          Sign in to manage AI seed content, moderation, provider logs, and feed
          diagnostics.
        </p>

        {searchParams.error && (
          <p style={{ color: "#f87171" }}>{searchParams.error}</p>
        )}

        <form action="/api/auth/login" method="post" className="grid">
          <input
            name="email"
            type="email"
            placeholder="Email"
            defaultValue="admin@yohpal.com"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
          />
          <button type="submit">Login</button>
        </form>

        <p style={{ color: "#a1a1aa", marginTop: 16 }}>
          Default seed admin: <strong>admin@yohpal.com</strong> /{" "}
          <strong>ChangeMe123!</strong>
        </p>
      </section>
    </main>
  );
}
