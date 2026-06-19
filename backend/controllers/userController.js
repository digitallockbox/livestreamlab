const userService = require("../services/userService");

async function getProfile(req, res) {
  const { id } = req.params;

  if (id === "me") {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const current = await userService.getById(req.user.userId);
    if (!current) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(current);
  }

  const profile = await userService.getById(id);
  if (!profile) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json(profile);
}

async function updateProfile(req, res) {
  const { id } = req.params;

  const targetId = id === "me" ? req.user?.userId : id;
  if (!targetId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!req.user || req.user.userId !== targetId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const updated = await userService.updateProfile(targetId, req.body || {});
  if (!updated) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json(updated);
}

module.exports = {
  getProfile,
  updateProfile,
};
