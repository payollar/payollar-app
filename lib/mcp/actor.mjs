import { createHash, timingSafeEqual } from "crypto";

export async function loadActor(db, userId) {
  if (!userId) return null;
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      mediaAgency: { select: { id: true } },
    },
  });
  if (!user) return null;
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    agencyId: user.mediaAgency?.id || null,
  };
}

export async function loadActorByEmail(db, email) {
  if (!email) return null;
  const user = await db.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true },
  });
  if (!user) {
    const fallback = await db.user.findFirst({
      where: { email: { equals: email.trim(), mode: "insensitive" } },
      select: { id: true },
    });
    return fallback ? loadActor(db, fallback.id) : null;
  }
  return loadActor(db, user.id);
}

function hashesEqual(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function tokenHash(token) {
  return createHash("sha256").update(token).digest("hex");
}

export async function resolveBearer(db, token) {
  if (!token) return null;
  const staticKey = process.env.MCP_API_KEY;
  if (staticKey && token.length === staticKey.length && hashesEqual(token, staticKey)) {
    const email = process.env.MCP_CURSOR_EMAIL;
    if (!email) return { error: "cursor_unlinked" };
    const actor = await loadActorByEmail(db, email);
    return actor ? { actor, via: "cursor" } : { error: "cursor_user_missing" };
  }

  const row = await db.mcpAccessToken.findUnique({
    where: { tokenHash: tokenHash(token) },
  });
  if (!row || row.expiresAt.getTime() < Date.now()) return null;
  const actor = await loadActor(db, row.userId);
  return actor ? { actor, via: "oauth" } : null;
}
