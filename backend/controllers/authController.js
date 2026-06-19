const { resolveRole, createSessionToken } = require("../services/authService");
const userService = require("../services/userService");

const OAUTH_PROVIDERS = new Set(["google", "twitch", "x", "youtube"]);

function frontendCallback(redirect) {
  return redirect || "http://localhost:3000/auth/callback";
}

async function issueSession({ provider, providerId, name, avatar }) {
  const role = resolveRole(provider, providerId);
  const user = await userService.upsertUser({
    provider,
    providerId,
    name,
    avatar,
    role,
  });

  const token = createSessionToken(user);
  return { token, user };
}

async function providerStart(req, res) {
  const { provider } = req.params;
  if (!OAUTH_PROVIDERS.has(provider)) {
    return res.status(404).json({ error: "Unsupported auth provider" });
  }

  const redirect = frontendCallback(req.query.redirect);

  const callbackUrl = `/auth/${provider}/callback`
    + `?providerId=${encodeURIComponent(req.query.providerId || "")}`
    + `&name=${encodeURIComponent(req.query.name || "")}`
    + `&avatar=${encodeURIComponent(req.query.avatar || "")}`
    + `&redirect=${encodeURIComponent(redirect)}`;

  if (!req.query.providerId) {
    return res.json({
      provider,
      next: callbackUrl,
      message:
        "Simulated OAuth start. Supply providerId in query to complete callback (or wire real OAuth provider SDK).",
    });
  }

  return res.redirect(callbackUrl);
}

async function providerCallback(req, res) {
  const { provider } = req.params;
  const { providerId, name, avatar, redirect } = req.query;

  if (!OAUTH_PROVIDERS.has(provider)) {
    return res.status(404).json({ error: "Unsupported auth provider" });
  }

  if (!providerId) {
    return res.status(400).json({ error: "providerId is required" });
  }

  const session = await issueSession({
    provider,
    providerId,
    name,
    avatar,
  });

  const finalRedirect = frontendCallback(redirect);
  if (finalRedirect) {
    const separator = finalRedirect.includes("?") ? "&" : "?";
    return res.redirect(`${finalRedirect}${separator}token=${encodeURIComponent(session.token)}`);
  }

  return res.json(session);
}

async function phantomLogin(req, res) {
  const { walletAddress, name, avatar } = req.body || {};

  if (!walletAddress) {
    return res.status(400).json({ error: "walletAddress is required" });
  }

  const session = await issueSession({
    provider: "phantom",
    providerId: walletAddress,
    name,
    avatar,
  });

  return res.json(session);
}

async function login(req, res) {
  const { provider = "google", providerId, name, avatar } = req.body || {};
  if (!providerId) {
    return res.status(400).json({ error: "providerId is required" });
  }

  if (!OAUTH_PROVIDERS.has(provider) && provider !== "phantom") {
    return res.status(400).json({ error: "Unsupported provider" });
  }

  const session = await issueSession({ provider, providerId, name, avatar });
  return res.json(session);
}

async function session(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const persisted = await userService.getById(req.user.userId);

  return res.json({
    userId: persisted?.id || req.user.userId,
    role: persisted?.role || req.user.role,
    provider: persisted?.provider || req.user.provider,
    providerId: persisted?.providerId || req.user.providerId,
    name: persisted?.name || req.user.name,
    avatar: persisted?.avatar || req.user.avatar,
    displayName: persisted?.displayName || persisted?.name || req.user.name,
    bio: persisted?.bio || "",
    timezone: persisted?.timezone || "UTC",
    onboardingComplete: persisted?.onboardingComplete || false,
    ownedName: persisted?.ownedName || null,
    web3Domain: persisted?.web3Domain || null,
    emailIdentity: persisted?.emailIdentity || null,
  });
}

async function logout(_req, res) {
  return res.json({ success: true });
}

module.exports = {
  providerStart,
  providerCallback,
  phantomLogin,
  login,
  session,
  logout,
};
