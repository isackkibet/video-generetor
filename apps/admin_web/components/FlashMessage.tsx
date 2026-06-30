export function FlashMessage({
  success,
  error,
}: {
  success?: string;
  error?: string;
}) {
  if (!success && !error) return null;
  return (
    <div
      className={success ? "flash success" : "flash error"}
      style={{ marginBottom: 20 }}
    >
      {success || error}
    </div>
  );
}
