const crypto = require("crypto");

const SESSION_SECRET = process.env.SESSION_SECRET || "dev-session-secret-change-me";
const SESSION_TTL_SECONDS = Number(process.env.SESSION_TTL_SECONDS || 60 * 60 * 24 * 7);

function parseIds(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function adminIds() {
  return {
    google: parseIds(process.env.ADMIN_GOOGLE_IDS),
    twitch: parseIds(process.env.ADMIN_TWITCH_IDS),
    x: parseIds(process.env.ADMIN_X_IDS),
    youtube: parseIds(process.env.ADMIN_YOUTUBE_IDS),
    phantom: parseIds(process.env.ADMIN_PHANTOM_IDS),
  };
}

function resolveRole(provider, providerId) {
  const ids = adminIds();
  return ids[provider]?.includes(String(providerId)) ? "admin" : "creator";
}

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function signToken(payload) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedBody = base64url(JSON.stringify(body));
  const signingInput = `${encodedHeader}.${encodedBody}`;

  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(signingInput)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${signingInput}.${signature}`;
}

function verifyToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedBody, signature] = parts;
  const signingInput = `${encodedHeader}.${encodedBody}`;

  const expected = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(signingInput)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  if (signature !== expected) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedBody, "base64url").toString("utf8"));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function createSessionToken(user) {
  return signToken({
    userId: user.id,
    role: user.role,
    provider: user.provider,
    providerId: user.providerId,
    name: user.name,
    avatar: user.avatar || null,
  });
}

module.exports = {
  resolveRole,
  createSessionToken,
  verifyToken,
};
