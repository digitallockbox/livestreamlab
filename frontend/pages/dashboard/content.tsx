import RoleGate from "../../src/dashboard/shared/ui/RoleGate";
import { useEffect, useState } from "react";
import {
  getCreatorStreams,
  getMessageThread,
  markMessageThreadRead,
  sendMessage,
} from "../../src/dashboard/api/engine/engine-bridge";

export default function ContentPage() {
  const [streams, setStreams] = useState<unknown>(null);
  const [threadId, setThreadId] = useState("general");
  const [messageInput, setMessageInput] = useState("");
  const [thread, setThread] = useState<unknown>(null);
  const [status, setStatus] = useState("Ready.");

  async function loadStreams() {
    const res = await getCreatorStreams();
    if (!res.ok) {
      setStatus(res.error || "Unable to load creator streams");
      return;
    }

    setStreams(res.data);
    setStatus("Creator streams loaded");
  }

  async function loadThread() {
    const res = await getMessageThread(threadId.trim() || "general");
    if (!res.ok) {
      setStatus(res.error || "Unable to load thread");
      return;
    }

    setThread(res.data);
    setStatus("Thread loaded");
  }

  useEffect(() => {
    loadStreams();
  }, []);

  async function postMessage() {
    if (!messageInput.trim()) {
      setStatus("Write a message before sending");
      return;
    }

    const res = await sendMessage({
      threadId: threadId.trim() || "general",
      text: messageInput.trim(),
    });
    if (!res.ok) {
      setStatus(res.error || "Unable to send message");
      return;
    }

    setMessageInput("");
    await loadThread();
  }

  async function markRead() {
    const res = await markMessageThreadRead(threadId.trim() || "general");
    if (!res.ok) {
      setStatus(res.error || "Unable to mark thread as read");
      return;
    }

    setStatus("Thread marked as read");
  }

  return (
    <RoleGate requiredRoles={["admin", "creator"]}>
      <main className="space-y-4 text-white">
        <h1 className="text-2xl font-bold">Content</h1>
        <div className="card">
          <h2 className="mb-2 text-lg font-semibold">Creator Streams</h2>
          <button className="rounded bg-blue-600 px-4 py-2" onClick={loadStreams}>
            Refresh Streams
          </button>
          <pre className="mt-3 overflow-auto rounded bg-black/40 p-3 text-xs">
            {JSON.stringify(streams, null, 2)}
          </pre>
        </div>

        <div className="card">
          <h2 className="mb-2 text-lg font-semibold">Thread Messaging</h2>
          <label>
            Thread ID
            <input
              className="mt-1 w-full rounded border border-gray-700 bg-gray-950 px-3 py-2"
              value={threadId}
              onChange={(event) => setThreadId(event.target.value)}
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="rounded bg-blue-600 px-4 py-2" onClick={loadThread}>
              Load Thread
            </button>
            <button className="rounded bg-gray-700 px-4 py-2" onClick={markRead}>
              Mark Read
            </button>
          </div>

          <label className="mt-3 block">
            Message
            <textarea
              className="mt-1 w-full rounded border border-gray-700 bg-gray-950 px-3 py-2"
              value={messageInput}
              onChange={(event) => setMessageInput(event.target.value)}
              rows={3}
            />
          </label>
          <button className="mt-3 rounded bg-emerald-600 px-4 py-2" onClick={postMessage}>
            Send Message
          </button>

          <pre className="mt-3 overflow-auto rounded bg-black/40 p-3 text-xs">
            {JSON.stringify(thread, null, 2)}
          </pre>
          <p className="mt-2 text-sm text-gray-300">{status}</p>
        </div>
      </main>
    </RoleGate>
  );
}
