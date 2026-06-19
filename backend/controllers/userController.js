async function getProfile(req, res) {
  const { id } = req.params;

  return res.json({
    id,
    displayName: "Live Creator",
    plan: "pro",
    timezone: "UTC",
  });
}

async function updateProfile(req, res) {
  const { id } = req.params;

  return res.json({
    id,
    ...req.body,
    updatedAt: new Date().toISOString(),
  });
}

module.exports = {
  getProfile,
  updateProfile,
};
