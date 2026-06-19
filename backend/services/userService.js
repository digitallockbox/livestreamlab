const users = new Map();

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
  return created;
}

module.exports = {
  upsertUser,
};
