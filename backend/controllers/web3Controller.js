const web3NameService = require("../services/web3NameService");

async function checkName(req, res) {
  const { name } = req.query || {};
  const result = await web3NameService.checkAvailability(name);
  return res.json(result);
}

async function purchaseName(req, res) {
  const { name } = req.body || {};
  const result = await web3NameService.purchaseName({ user: req.user, rawName: name });

  if (result.status === "UNAUTHORIZED") {
    return res.status(401).json(result);
  }

  return res.json(result);
}

async function getMyName(req, res) {
  const result = await web3NameService.getMyName(req.user);
  if (!result) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return res.json(result);
}

async function getProfile(req, res) {
  const profile = await web3NameService.getPublicProfile(req.params.name);
  if (!profile) {
    return res.status(404).json({ error: "Name not found" });
  }

  return res.json(profile);
}

module.exports = {
  checkName,
  purchaseName,
  getMyName,
  getProfile,
};
