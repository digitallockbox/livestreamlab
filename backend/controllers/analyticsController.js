const analyticsService = require("../services/analyticsService");

async function getOverview(_req, res, next) {
  try {
    const data = await analyticsService.getOverview();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function getStreamAnalytics(_req, res, next) {
  try {
    const data = await analyticsService.getStreamAnalytics();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function getContentAnalytics(_req, res, next) {
  try {
    const data = await analyticsService.getContentAnalytics();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOverview,
  getStreamAnalytics,
  getContentAnalytics,
};
