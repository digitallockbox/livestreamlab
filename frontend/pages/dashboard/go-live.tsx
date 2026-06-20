import RoleGate from "../../src/dashboard/shared/ui/RoleGate";
import { useEffect, useState } from "react";
import {
  endStream,
  getStreamStatus,
  startStream,
  type StreamControlPayload,
} from "../../src/dashboard/api/engine/engine-bridge";

export default function GoLivePage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [statusPayload, setStatusPayload] = useState<unknown>(null);
  const [message, setMessage] = useState("Ready.");
  const [working, setWorking] = useState(false);

  async function refreshStatus() {
    const status = await getStreamStatus();
    if (!status.ok) {
      setMessage(status.error || "Unable to load stream status");
      return;
    }
    setStatusPayload(status.data);
    setMessage("Stream status refreshed");
  }

  useEffect(() => {
    refreshStatus();
  }, []);

  async function onStart() {
    setWorking(true);
    const payload: StreamControlPayload = { title, category, description };
    const started = await startStream(payload);
    if (!started.ok) {
      setMessage(started.error || "Unable to start stream");
      setWorking(false);
      return;
    }

    setMessage("Stream started.");
    await refreshStatus();
    setWorking(false);
  }

  async function onEnd() {
    setWorking(true);
    const ended = await endStream();
    if (!ended.ok) {
      setMessage(ended.error || "Unable to end stream");
      setWorking(false);
      return;
    }

    setMessage("Stream ended.");
    await refreshStatus();
    setWorking(false);
  }

  return (
    <RoleGate requiredRoles={["admin", "creator"]}>
      <main className="space-y-4 text-white">
        <h1 className="text-2xl font-bold">Go Live</h1>
        <div className="card">
          <p className="mb-3">Start, monitor, and stop a live stream from this panel.</p>

          <div className="grid gap-3 md:grid-cols-2">
            <label>
              Title
              <input
                className="mt-1 w-full rounded border border-gray-700 bg-gray-950 px-3 py-2"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="My Live Session"
              />
            </label>
            <label>
              Category
              <input
                className="mt-1 w-full rounded border border-gray-700 bg-gray-950 px-3 py-2"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Gaming / Podcast / Tutorial"
              />
            </label>
          </div>

          <label className="mt-3 block">
            Description
            <textarea
              className="mt-1 w-full rounded border border-gray-700 bg-gray-950 px-3 py-2"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
            />
          </label>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="rounded bg-emerald-600 px-4 py-2"
              disabled={working}
              onClick={onStart}
            >
              Start Stream
            </button>
            <button
              className="rounded bg-blue-600 px-4 py-2"
              disabled={working}
              onClick={refreshStatus}
            >
              Refresh Status
            </button>
            <button className="rounded bg-red-600 px-4 py-2" disabled={working} onClick={onEnd}>
              End Stream
            </button>
          </div>

          <p className="mt-3 text-sm text-gray-300">{message}</p>
          <pre className="mt-3 overflow-auto rounded bg-black/40 p-3 text-xs">
            {JSON.stringify(statusPayload, null, 2)}
          </pre>
        </div>
      </main>
    </RoleGate>
  );
}
