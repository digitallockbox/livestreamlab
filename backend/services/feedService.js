async function getFeed({ limit = 20 } = {}) {
  const feed = Array.from({ length: Math.max(1, Math.min(limit, 50)) }).map((_, index) => ({
    id: `feed_${index + 1}`,
    title: `Stream highlight #${index + 1}`,
    type: index % 2 === 0 ? "stream" : "content",
    createdAt: new Date(Date.now() - index * 60000).toISOString(),
  }));

  return { items: feed, total: feed.length };
}

module.exports = {
  getFeed,
};
