async function getHealth() {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  };
}

async function getEnginesHealth() {
  return {
    ingest: "healthy",
    transcoder: "healthy",
    chat: "healthy",
    recommendation: "healthy",
  };
}

module.exports = {
  getHealth,
  getEnginesHealth,
};
