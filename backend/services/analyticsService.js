async function getOverview() {
  return {
    creators: 128,
    activeStreams: 23,
    watchMinutes24h: 98421,
    revenue24h: 4120.55,
    platforms: {
      google: {
        creators: 24,
        activeStreams: 4,
        watchMinutes24h: 14300,
        revenue24h: 540.2,
      },
      twitch: {
        creators: 42,
        activeStreams: 9,
        watchMinutes24h: 35120,
        revenue24h: 1730.4,
      },
      x: {
        creators: 19,
        activeStreams: 3,
        watchMinutes24h: 8605,
        revenue24h: 286.15,
      },
      youtube: {
        creators: 31,
        activeStreams: 6,
        watchMinutes24h: 28610,
        revenue24h: 1287.7,
      },
      phantom: {
        creators: 12,
        activeStreams: 1,
        watchMinutes24h: 11786,
        revenue24h: 276.1,
      },
    },
  };
}

async function getStreamAnalytics() {
  return {
    avgConcurrentViewers: 712,
    peakViewers: 1930,
    avgWatchTimeMinutes: 17.4,
    platformMix: {
      google: 0.14,
      twitch: 0.43,
      x: 0.11,
      youtube: 0.22,
      phantom: 0.1,
    },
  };
}

async function getContentAnalytics() {
  return {
    uploads24h: 54,
    topCategory: "Gaming",
    engagementRate: 0.086,
    uploadsByPlatform24h: {
      google: 8,
      twitch: 19,
      x: 7,
      youtube: 15,
      phantom: 5,
    },
  };
}

module.exports = {
  getOverview,
  getStreamAnalytics,
  getContentAnalytics,
};
