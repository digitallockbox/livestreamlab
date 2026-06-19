const users = new Map();
const usersById = new Map();

function key(provider, providerId) {
  return `${provider}:${providerId}`;
}

async function upsertUser({ provider, providerId, name, avatar, role }) {
  const mapKey = key(provider, providerId);
  const existing = users.get(mapKey);

  if (existing) {
    const updated = {
      ...existing,
      name: name || existing.name,
      avatar: avatar || existing.avatar,
      role,
      updatedAt: new Date().toISOString(),
    };
    users.set(mapKey, updated);
    usersById.set(updated.id, updated);
    return updated;
  }

  const created = {
    id: `usr_${users.size + 1}`,
    provider,
    providerId,
    name: name || `${provider} user`,
    displayName: name || `${provider} user`,
    avatar: avatar || null,
    role,
    bio: "",
    timezone: "UTC",
    onboardingComplete: false,
    setupCompletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.set(mapKey, created);
  usersById.set(created.id, created);
  return created;
}

async function getById(userId) {
  return usersById.get(String(userId)) || null;
}

async function bindNameToUser(userId, ownedName) {
  const existing = usersById.get(String(userId));
  if (!existing) return null;

  const updated = {
    ...existing,
    ownedName,
    web3Domain: ownedName ? `${ownedName}.livestreamlab` : null,
    emailIdentity: `${ownedName || existing.providerId}@livestreamlab`,
    updatedAt: new Date().toISOString(),
  };

  usersById.set(updated.id, updated);
  users.set(key(updated.provider, updated.providerId), updated);
  return updated;
}

async function updateProfile(userId, updates) {
  const existing = usersById.get(String(userId));
  if (!existing) return null;

  const updated = {
    ...existing,
    displayName: updates.displayName ?? existing.displayName,
    name: updates.displayName ?? existing.name,
    avatar: updates.avatar ?? existing.avatar,
    bio: updates.bio ?? existing.bio,
    timezone: updates.timezone ?? existing.timezone,
    onboardingComplete:
      typeof updates.onboardingComplete === "boolean"
        ? updates.onboardingComplete
        : existing.onboardingComplete,
    setupCompletedAt:
      updates.onboardingComplete === true
        ? new Date().toISOString()
        : existing.setupCompletedAt,
    updatedAt: new Date().toISOString(),
  };

  usersById.set(updated.id, updated);
  users.set(key(updated.provider, updated.providerId), updated);
  return updated;
}

module.exports = {
  upsertUser,
  getById,
  bindNameToUser,
  updateProfile,
};
