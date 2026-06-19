const systemService = require("../services/systemService");

async function getHealth(_req, res, next) {
  try {
    const data = await systemService.getHealth();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function getEnginesHealth(_req, res, next) {
  try {
    const data = await systemService.getEnginesHealth();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getHealth,
  getEnginesHealth,
};
