let currentStream = {
  status: "idle",
  title: null,
  startedAt: null,
};

async function getStatus() {
  return currentStream;
}

async function start(payload = {}) {
  currentStream = {
    status: "live",
    title: payload.title || "Untitled Stream",
    startedAt: new Date().toISOString(),
  };

  return currentStream;
}

async function stop() {
  currentStream = {
    status: "idle",
    title: null,
    startedAt: null,
  };

  return currentStream;
}

module.exports = {
  getStatus,
  start,
  stop,
};
