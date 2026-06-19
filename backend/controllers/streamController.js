const streamService = require("../services/streamService");

async function getStreamStatus(_req, res, next) {
  try {
    const data = await streamService.getStatus();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function startStream(req, res, next) {
  try {
    const data = await streamService.start(req.body || {});
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function stopStream(_req, res, next) {
  try {
    const data = await streamService.stop();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStreamStatus,
  startStream,
  stopStream,
};
