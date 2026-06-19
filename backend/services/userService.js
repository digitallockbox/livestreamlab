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
    avatar: avatar || null,
    role,
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

module.exports = {
  upsertUser,
  getById,
  bindNameToUser,
};
