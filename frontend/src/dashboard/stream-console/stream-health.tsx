import { useEffect, useState } from "react";
import { getEngineHealth } from "../api/engine/engine-bridge";

export default function StreamHealth() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getEngineHealth().then(setData);
  }, []);

  if (!data)
    return <div className="text-white p-8">Loading stream health...</div>;

  return (
    <div className="p-8 text-white">
      <h2 className="text-2xl font-bold mb-4">Stream Engine Health</h2>
      <pre className="bg-gray-900 p-4 rounded text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
