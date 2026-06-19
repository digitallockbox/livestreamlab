const feedService = require("../services/feedService");

async function getFeed(req, res, next) {
  try {
    const limit = Number(req.query.limit || 20);
    const data = await feedService.getFeed({ limit });
    res.json(data);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getFeed,
};
