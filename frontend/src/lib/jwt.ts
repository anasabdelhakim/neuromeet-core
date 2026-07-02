export function decodeJwtPayload(token: string): { role?: string; exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad) base64 += "=".repeat(4 - pad);

    const payload = JSON.parse(atob(base64));
    return payload;
  } catch (error) {
    return null;
  }
}

export function decodeJwtRole(token: string): string | null {
  const payload = decodeJwtPayload(token);
  return payload?.role || null;
}
