async function login(req, res) {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: "email is required" });
  }

  return res.json({
    token: "dev-session-token",
    user: { id: "u_001", email, role: "creator" },
  });
}

async function logout(_req, res) {
  return res.json({ success: true });
}

module.exports = {
  login,
  logout,
};
