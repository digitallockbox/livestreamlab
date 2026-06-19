import { useEffect, useState } from "react";
import { getOverviewAnalytics } from "../api/engine/engine-bridge";

export default function AnalyticsOverview() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getOverviewAnalytics().then(setData);
  }, []);

  if (!data) return <div className="text-white p-8">Loading analytics...</div>;

  return (
    <div className="p-8 text-white">
      <h2 className="text-2xl font-bold mb-4">Platform Overview</h2>
      <pre className="bg-gray-900 p-4 rounded text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
