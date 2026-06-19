async function getOverview() {
  return {
    creators: 128,
    activeStreams: 23,
    watchMinutes24h: 98421,
    revenue24h: 4120.55,
  };
}

async function getStreamAnalytics() {
  return {
    avgConcurrentViewers: 712,
    peakViewers: 1930,
    avgWatchTimeMinutes: 17.4,
  };
}

async function getContentAnalytics() {
  return {
    uploads24h: 54,
    topCategory: "Gaming",
    engagementRate: 0.086,
  };
}

module.exports = {
  getOverview,
  getStreamAnalytics,
  getContentAnalytics,
};
