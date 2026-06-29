export function serviceAuthHeaders() {
  return {
    "X-Service-Auth": process.env.SERVICE_AUTH_KEY || "",
  };
}

export function assertServiceAuth(headers: Record<string, string>) {
  const header = headers["x-service-auth"];
  if (
    !process.env.SERVICE_AUTH_KEY ||
    header !== process.env.SERVICE_AUTH_KEY
  ) {
    throw new Error("Invalid service auth header");
  }
}
