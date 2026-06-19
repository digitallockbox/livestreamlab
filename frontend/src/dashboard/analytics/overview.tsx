import { useEffect, useState } from "react";
import { getOverviewAnalytics } from "../api/engine/engine-bridge";

type PlatformOverview = {
  creators: number;
  activeStreams: number;
  watchMinutes24h: number;
  revenue24h: number;
};

type OverviewPayload = {
  creators: number;
  activeStreams: number;
  watchMinutes24h: number;
  revenue24h: number;
  platforms?: Record<string, PlatformOverview>;
};

export default function AnalyticsOverview() {
  const [data, setData] = useState<OverviewPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOverviewAnalytics().then((result) => {
      if (result.ok) {
        setData(result.data);
      } else {
        setError(result.error || "Unable to load analytics overview");
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-white p-8">Loading analytics...</div>;

  if (error) {
    return (
      <div className="p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Platform Overview</h2>
        <div className="bg-red-900/40 border border-red-500 rounded p-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-8 text-white">
      <h2 className="text-2xl font-bold mb-4">Platform Overview</h2>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(data?.platforms || {}).map(([platform, metrics]) => (
          <div key={platform} className="bg-gray-900 rounded border border-gray-700 p-4">
            <h3 className="text-lg font-semibold capitalize">{platform}</h3>
            <p className="text-sm text-gray-300">Creators: {metrics.creators}</p>
            <p className="text-sm text-gray-300">Active Streams: {metrics.activeStreams}</p>
            <p className="text-sm text-gray-300">Watch Minutes (24h): {metrics.watchMinutes24h}</p>
            <p className="text-sm text-gray-300">Revenue (24h): ${metrics.revenue24h.toFixed(2)}</p>
          </div>
        ))}
      </div>

      <pre className="bg-gray-900 p-4 rounded text-sm mt-4">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
