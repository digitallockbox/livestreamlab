import { useEffect, useState } from "react";
import { getEngineHealth } from "../api/engine/engine-bridge";

export default function StreamHealth() {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEngineHealth().then((result) => {
      if (result.ok) {
        setData(result.data);
      } else {
        setError(result.error || "Unable to load stream health");
      }
      setLoading(false);
    });
  }, []);

  if (loading)
    return <div className="text-white p-8">Loading stream health...</div>;

  if (error) {
    return (
      <div className="p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Stream Engine Health</h2>
        <div className="bg-red-900/40 border border-red-500 rounded p-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 text-white">
      <h2 className="text-2xl font-bold mb-4">Stream Engine Health</h2>
      <pre className="bg-gray-900 p-4 rounded text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
